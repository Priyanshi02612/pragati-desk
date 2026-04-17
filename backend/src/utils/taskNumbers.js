const Task = require("../models/Task");

const buildTaskNumber = (ticketNumber, sequence) => `${ticketNumber}-T${sequence}`;

const extractTaskSequence = (taskNumber, ticketNumber) => {
  const match = taskNumber?.match(new RegExp(`^${ticketNumber}-T(\\d+)$`));
  return match ? Number.parseInt(match[1], 10) : 0;
};

const getNextTaskNumber = async (ticketId, ticketNumber) => {
  const tasksForTicket = await Task.find({ ticketId })
    .sort({ createdAt: 1, _id: 1 })
    .select("taskNumber");

  const nextSequence =
    tasksForTicket.reduce(
      (highestSequence, task) =>
        Math.max(
          highestSequence,
          extractTaskSequence(task.taskNumber, ticketNumber),
        ),
      0,
    ) + 1;

  return buildTaskNumber(ticketNumber, nextSequence);
};

const ensureTaskNumbers = async () => {
  const tasks = await Task.find({})
    .populate("ticketId", "_id ticketNumber")
    .sort({ createdAt: 1, _id: 1 })
    .select("_id taskNumber ticketId");

  if (!tasks.length) {
    return;
  }

  const sequenceByTicket = new Map();
  const updates = [];

  tasks.forEach((task) => {
    const ticketId = task.ticketId?._id?.toString?.() || task.ticketId?.toString?.();
    const ticketNumber = task.ticketId?.ticketNumber;

    if (!ticketId || !ticketNumber) {
      return;
    }

    const nextSequence = (sequenceByTicket.get(ticketId) || 0) + 1;
    sequenceByTicket.set(ticketId, nextSequence);

    const expectedTaskNumber = buildTaskNumber(ticketNumber, nextSequence);

    if (task.taskNumber !== expectedTaskNumber) {
      updates.push(
        Task.updateOne(
          { _id: task._id },
          { $set: { taskNumber: expectedTaskNumber } },
        ),
      );
    }
  });

  if (updates.length) {
    await Promise.all(updates);
  }
};

module.exports = {
  ensureTaskNumbers,
  getNextTaskNumber,
};
