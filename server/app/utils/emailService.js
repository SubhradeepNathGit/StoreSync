const sendEmail = require('./sendEmail');

/**
 * Send employee welcome email with credentials
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.name - Employee name
 * @param {string} params.employeeId - Generated employee ID
 * @param {string} params.password - Generated password
 */
const sendEmployeeWelcomeEmail = async ({ to, name, employeeId, password }) => {
  const message = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #1a202c;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.025em; margin: 0; color: #000000; text-transform: uppercase;">StoreSync</h1>
        </div>
        <div style="border-top: 1px solid #edf2f7; padding-top: 32px;">
            <p style="font-size: 16px; font-weight: 500; margin: 0 0 16px 0;">Hi ${name},</p>
            <p style="font-size: 15px; color: #4a5568; line-height: 1.6; margin: 0 0 32px 0;">
                Welcome to the team. Your StoreSync account has been created. Use the credentials below to access your dashboard.
            </p>
            <div style="background-color: #f7fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 32px;">
                <div style="margin-bottom: 12px;">
                    <p style="font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px 0;">Employee ID</p>
                    <p style="font-size: 15px; font-weight: 600; color: #1a202c; margin: 0;">${employeeId}</p>
                </div>
                <div style="margin-bottom: 12px;">
                    <p style="font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px 0;">Email</p>
                    <p style="font-size: 15px; font-weight: 600; color: #1a202c; margin: 0;">${to}</p>
                </div>
                <div>
                    <p style="font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px 0;">Temporary Password</p>
                    <p style="font-size: 15px; font-weight: 600; color: #000000; margin: 0;">${password}</p>
                </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #000000; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Login to Dashboard</a>
            </div>

            <p style="font-size: 13px; color: #718096; text-align: center; margin: 32px 0 0 0;">
                Please change your password after your first login.
            </p>

            <div style="border-top: 1px solid #edf2f7; margin-top: 40px; padding-top: 32px; text-align: center;">
                <p style="font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 4px;">StoreSync Team</p>
                <p style="font-size: 11px; color: #a0aec0; margin-top: 24px;">
                    &copy; ${new Date().getFullYear()} StoreSync. All rights reserved.
                </p>
            </div>
        </div>
    </div>
    `;

  try {
    await sendEmail({
      email: to,
      subject: 'Welcome to StoreSync - Your Login Credentials',
      html: message,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

/**
 * Send password reset notification email
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.name - Employee name
 * @param {string} params.password - New password
 */
const sendPasswordResetEmail = async ({ to, name, password }) => {
  const message = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #1a202c;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.025em; margin: 0; color: #000000; text-transform: uppercase;">StoreSync</h1>
        </div>
        <div style="border-top: 1px solid #edf2f7; padding-top: 32px;">
            <p style="font-size: 16px; font-weight: 500; margin: 0 0 16px 0;">Hi ${name},</p>
            <p style="font-size: 15px; color: #4a5568; line-height: 1.6; margin: 0 0 32px 0;">
                Your StoreSync account password has been reset by an administrator. Below is your new temporary password.
            </p>

            <div style="text-align: center; margin: 40px 0;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 28px; font-weight: 700; letter-spacing: 2px; color: #000000; background-color: #f7fafc; padding: 16px 32px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    ${password}
                </span>
            </div>

            <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #000000; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">Login to Dashboard</a>
            </div>

            <p style="font-size: 13px; color: #718096; text-align: center; margin: 32px 0 0 0;">
                Please change this password immediately after logging in.
            </p>

            <div style="border-top: 1px solid #edf2f7; margin-top: 40px; padding-top: 32px; text-align: center;">
                <p style="font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 4px;">StoreSync Team</p>
                <p style="font-size: 11px; color: #a0aec0; margin-top: 24px;">
                    &copy; ${new Date().getFullYear()} StoreSync. All rights reserved.
                </p>
            </div>
        </div>
    </div>
    `;

  try {
    await sendEmail({
      email: to,
      subject: 'Your Password Has Been Reset',
      html: message,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send task assignment notification email
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email
 * @param {string} params.userName - Recipient name
 * @param {string} params.taskTitle - Task title
 * @param {string} params.dueDate - Task due date
 * @param {string} params.assignedBy - Name of the assigner
 */
const sendTaskAssignedEmail = async ({ to, userName, taskTitle, dueDate, assignedBy }) => {
  const formattedDate = new Date(dueDate).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const message = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 40px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #1a202c;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.025em; margin: 0; color: #000000; text-transform: uppercase;">StoreSync</h1>
        </div>
        <div style="border-top: 1px solid #edf2f7; padding-top: 32px;">
            <p style="font-size: 16px; font-weight: 500; margin: 0 0 16px 0;">Hi ${userName},</p>
            <p style="font-size: 15px; color: #4a5568; line-height: 1.6; margin: 0 0 32px 0;">
                You have been assigned a new task by <strong>${assignedBy}</strong>. Please find the details below.
            </p>
            
            <div style="background-color: #f7fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 32px;">
                <div style="margin-bottom: 12px;">
                    <p style="font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px 0;">Task Title</p>
                    <p style="font-size: 15px; font-weight: 600; color: #1a202c; margin: 0;">${taskTitle}</p>
                </div>
                <div>
                    <p style="font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px 0;">Due Date</p>
                    <p style="font-size: 15px; font-weight: 600; color: #e53e3e; margin: 0;">${formattedDate}</p>
                </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/tasks" style="background-color: #000000; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">View Task Details</a>
            </div>

            <div style="border-top: 1px solid #edf2f7; margin-top: 40px; padding-top: 32px; text-align: center;">
                <p style="font-size: 14px; font-weight: 600; color: #000000; margin-bottom: 4px;">StoreSync Team</p>
                <p style="font-size: 11px; color: #a0aec0; margin-top: 24px;">
                    &copy; ${new Date().getFullYear()} StoreSync. All rights reserved.
                </p>
            </div>
        </div>
    </div>
    `;

  try {
    await sendEmail({
      email: to,
      subject: `New Task Assigned: ${taskTitle}`,
      html: message,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending task assignment email:', error);
    return { success: false, error };
  }
};

module.exports = {
  sendEmployeeWelcomeEmail,
  sendPasswordResetEmail,
  sendTaskAssignedEmail,
};
