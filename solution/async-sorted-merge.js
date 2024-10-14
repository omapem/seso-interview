"use strict";

const AsyncMinHeapLogSourceSorter = require("../lib/async-min-heap-log-source-sorter");

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = (logSources, printer) => {
  return new Promise(async (resolve, reject) => {
    const asyncMinHeapLogSourceSorter = new AsyncMinHeapLogSourceSorter();

    /*
    Since the log sources are already sorted, we want to asynchronously:
    1) Go through each log source and grab the first logEntry
    2) Update the logEntry with the index of the logSource where this log originated from. This will allow us
      to quickly retrieve the log again for the next logEntry
    3) Add the initial logEntries to the min-heap for sorting
    4) Process remaining entries until the heap is empty
    */
    for (let i = 0; i < logSources.length; i++) {
      const logEntry = await logSources[i].popAsync();
      logEntry.logSourceIndex = i;
      await asyncMinHeapLogSourceSorter.insert(logEntry);
    }

    // Printing logic
    while (!asyncMinHeapLogSourceSorter.isEmpty()) {
      let logEntry = await asyncMinHeapLogSourceSorter.getMinLogEntry();
      printer.print(logEntry);

      /*
      Get next log entry from that log's source. It's possible that this is the next earliest entry.
      Once added to the heap, this entry will be sorted with the existing entries.
      */
      const currentLogSource = logSources[logEntry.logSourceIndex];

      try {
        const nextLogEntry = await currentLogSource.popAsync();
        if (nextLogEntry) {
          nextLogEntry.logSourceIndex = logEntry.logSourceIndex;
          await asyncMinHeapLogSourceSorter.insert(nextLogEntry);
          // asyncMinHeapLogSourceSorter.printHeapInOrder();
        }
      } catch (error) {
        console.error(
          `Error occurred during async processing for entry ${nextLogEntry}:`,
          error
        );
        reject(error);
      }
    }

    printer.done();
    resolve(console.log("Async sort complete."));
  });
};
