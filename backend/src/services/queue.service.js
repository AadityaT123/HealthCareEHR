import async from "async";

/**
 * Managed Task Queue for background operations.
 * Prevents blocking the event loop during external API syncs.
 */
class TaskQueue {
    constructor(concurrency = 5) {
        this.queue = async.queue(async (task) => {
            try {
                console.log(`[Queue] Processing task: ${task.name}`);
                await task.fn();
                console.log(`[Queue] Successfully completed task: ${task.name}`);
            } catch (err) {
                console.error(`[Queue] Error in task ${task.name}:`, err.message || err);
                
                // Simple retry logic
                if (!task.retries) task.retries = 0;
                if (task.retries < 3) {
                    task.retries++;
                    console.log(`[Queue] Retrying task ${task.name} (${task.retries}/3)...`);
                    this.push(task);
                } else {
                    console.error(`[Queue] Task ${task.name} failed after 3 retries.`);
                }
            }
        }, concurrency);
    }

    push(task) {
        this.queue.push(task);
    }

    getStats() {
        return {
            pending: this.queue.length(),
            running: this.queue.running(),
            idle: this.queue.idle()
        };
    }
}

const GlobalTaskQueue = new TaskQueue();
export default GlobalTaskQueue;
