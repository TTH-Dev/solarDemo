import cron from 'node-cron';
import Project from '../models/Project/project.js'; // adjust the path if needed

export const startAutoClearMembersJob = () => {
  // Run every day at 12:01 AM
  cron.schedule('0 0 * * *', async () => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Clear members if they were added today
    const result = await Project.updateMany(
      { membersAddedAt: { $gte: todayStart } },
      { $set: { members: [] } }
    );

    console.log(`Auto cleared members from ${result.modifiedCount} projects`);
  } catch (err) {
    console.error('Error clearing members:', err);
  }
});
};
