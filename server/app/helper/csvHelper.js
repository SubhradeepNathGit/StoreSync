const { Readable } = require('stream');
const csv = require('csv-parser');
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

// parse csv buffer and return product objects
exports.parseCsvBuffer = async (buffer, shopId) => {
    return new Promise((resolve, reject) => {
        const rows = [];
        let rowCount = 1;

        let content = buffer.toString('utf8');

        // remove bom if present
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }

        const firstLine = content.split('\n')[0];
        const commaCount = (firstLine.match(/,/g) || []).length;
        const semicolonCount = (firstLine.match(/;/g) || []).length;
        const separator = semicolonCount > commaCount ? ';' : ',';

        Readable.from(content)
            .pipe(csv({
                separator: separator,
                mapHeaders: ({ header }) => {
                    if (!header) return '';
                    const h = header.trim().toLowerCase().replace(/[\ufeff]/g, '');

                    if (h.includes('name')) return 'name';
                    if (h.includes('desc')) return 'description';
                    if (h.includes('price') || h.includes('cost') || h.includes('mrp')) return 'price';
                    if (h.includes('sub')) return 'subcategory';
                    if (h.includes('cat')) return 'category';
                    if (h.includes('group') || h.includes('set')) return 'group';
                    if (h.includes('stock') || h.includes('avail') || h.includes('qty')) return 'instock';
                    if (h.includes('img') || h.includes('image') || h.includes('photo')) return 'image';
                    return h.replace(/[^a-z]/g, '');
                },
                mapValues: ({ value }) => value ? value.trim() : ''
            }))
            .on('data', (data) => {
                rowCount++;
                rows.push({ data, rowNum: rowCount });
            })
            .on('end', async () => {
                try {
                    const results = await processRows(rows, shopId);
                    resolve(results);
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', (err) => reject(err));
    });
};

async function processRows(rows, shopId) {
    const results = { products: [], errors: [] };
    const requiredCols = ['name', 'description', 'price', 'category'];

    if (rows.length === 0) {
        throw new Error('CSV must have a header row and at least one data row.');
    }

    const firstRowCols = Object.keys(rows[0].data);
    const missingCols = requiredCols.filter(c => !firstRowCols.includes(c));
    if (missingCols.length > 0) {
        throw new Error(`CSV missing required columns: ${missingCols.join(', ')}`);
    }

    const categoryCache = {};
    const subcategoryCache = {};

    for (const { data: row, rowNum } of rows) {
        try {
            if (!row.name) throw new Error('name is required');
            if (!row.description) throw new Error('description is required');
            if (!row.price || isNaN(parseFloat(row.price))) throw new Error('price must be a valid number');
            if (!row.category) throw new Error('category is required');

            const catKey = row.category.trim().toLowerCase();
            if (!categoryCache[catKey]) {
                let cat = await Category.findOne({
                    name: { $regex: new RegExp(`^${escapeRegex(row.category.trim())}$`, 'i') },
                    shopId
                });
                
                if (!cat) {
                    cat = await Category.create({ name: row.category.trim(), shopId });
                }
                categoryCache[catKey] = cat._id;
            }
            const categoryId = categoryCache[catKey];

            let subcategoryId = undefined;
            if (row.subcategory) {
                const subKey = row.subcategory.trim().toLowerCase() + '-' + categoryId.toString();
                if (!subcategoryCache[subKey]) {
                    let sub = await Subcategory.findOne({
                        name: { $regex: new RegExp(`^${escapeRegex(row.subcategory.trim())}$`, 'i') },
                        category: categoryId,
                        shopId
                    });
                    
                    if (!sub) {
                        sub = await Subcategory.create({ 
                            name: row.subcategory.trim(), 
                            category: categoryId, 
                            group: row.group || 'Imported', 
                            shopId 
                        });
                    }
                    subcategoryCache[subKey] = sub._id;
                }
                subcategoryId = subcategoryCache[subKey];
            }

            let inStock = true;
            if (row.instock !== undefined && row.instock !== '') {
                inStock = row.instock.toLowerCase() !== 'false' && row.instock !== '0';
            }

            results.products.push({
                name: row.name,
                description: row.description,
                price: parseFloat(row.price),
                category: categoryId,
                subcategory: subcategoryId,
                inStock,
                image: row.image || undefined,
            });
        } catch (err) {
            results.errors.push({ row: rowNum, message: err.message });
        }
    }

    return results;
}

function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
