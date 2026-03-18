const cron = require("node-cron");
const Task = require("../models/Task");
const { sendTaskReminderEmail } = require("./emailService");

/**
 * Initialize all scheduled tasks
 */
const initSchedulers = () => {
    
    cron.schedule("0 9 * * *", async () => {
        console.log("Running Task Reminder Scheduler...");
        
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            
            const tasksDueSoon = await Task.find({
                status: { $ne: "Completed" },
                isDeleted: false,
                dueDate: { 
                    $gte: new Date(),
                    $lte: tomorrow
                }
            }).populate("assignedTo", "name email");

            console.log(`Found ${tasksDueSoon.length} tasks due soon.`);

            for (const task of tasksDueSoon) {
                if (task.assignedTo && task.assignedTo.email) {
                    await sendTaskReminderEmail({
                        to: task.assignedTo.email,
                        userName: task.assignedTo.name,
                        taskTitle: task.title,
                        dueDate: task.dueDate
                    });
                    console.log(`Reminder sent to ${task.assignedTo.email} for task: ${task.title}`);
                }
            }
        } catch (err) {
            console.error("Error in Task Reminder Scheduler:", err);
        }
    });

    console.log("Schedulers initialized.");
};

module.exports = { initSchedulers };
