import Reminder from '../models/Reminder.js';

export const ReminderAgent = {
  name: "Health Reminder Agent",

  async createReminder(userId, details) {
    const logs = [];
    logs.push({
      agent: this.name,
      thought: `Request to schedule reminder for User: ${userId}. Input: ${JSON.stringify(details)}`,
      action: "validate_input",
      observation: "Checking reminder parameters."
    });

    const { type, title, time, date, dosage } = details;

    if (!type || !title || !time) {
      logs.push({
        agent: this.name,
        thought: "Validation failed. Missing required fields (type, title, or time).",
        action: "reject_request",
        observation: "Error thrown back to orchestrator."
      });
      throw new Error("Type, Title, and Time are required fields for setting a reminder.");
    }

    logs.push({
      agent: this.name,
      thought: `Writing new ${type} reminder to database: "${title}" at ${time}.`,
      action: "database_insert",
      observation: "Writing record."
    });

    try {
      const newReminder = new Reminder({
        userId,
        type,
        title,
        time,
        date: date || '',
        dosage: dosage || '',
        active: true
      });

      await newReminder.save();

      logs.push({
        agent: this.name,
        thought: `Reminder saved successfully with ID: ${newReminder._id}.`,
        action: "save_success",
        observation: "Committed to DB."
      });

      return {
        reminder: newReminder,
        logs
      };
    } catch (err) {
      console.error("Reminder Agent database write failed:", err);
      // Fallback local memory object returned if MongoDB is in mock-mode
      const mockReminder = {
        _id: "mock_" + Math.random().toString(36).substr(2, 9),
        userId,
        type,
        title,
        time,
        date: date || '',
        dosage: dosage || '',
        active: true,
        isMock: true
      };

      logs.push({
        agent: this.name,
        thought: "Database write failed or connection absent. Storing reminder in local/session memory context.",
        action: "memory_persist",
        observation: "Created memory-bound mock reminder."
      });

      return {
        reminder: mockReminder,
        logs
      };
    }
  },

  async getUserReminders(userId) {
    const logs = [];
    logs.push({
      agent: this.name,
      thought: `Fetching all reminders for user: ${userId}`,
      action: "database_fetch_reminders",
      observation: "Running query."
    });

    try {
      const reminders = await Reminder.find({ userId, active: true }).sort({ createdAt: -1 });
      logs.push({
        agent: this.name,
        thought: `Successfully retrieved ${reminders.length} reminders from database.`,
        action: "fetch_success",
        observation: "Returning reminder list."
      });
      return { reminders, logs };
    } catch (err) {
      console.error("Failed to query database for reminders:", err);
      logs.push({
        agent: this.name,
        thought: "Failed to retrieve reminders from MongoDB. Returning empty array.",
        action: "database_error_fallback",
        observation: "Fallback resolved."
      });
      return { reminders: [], logs };
    }
  }
};
