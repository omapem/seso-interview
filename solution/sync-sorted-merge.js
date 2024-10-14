"use strict";

const MinHeapLogSourceSorter = require("../lib/min-heap-log-source-sorter");

// Print all entries, across all of the sources, in chronological order.

module.exports = (logSources, printer) => {
  const minHeapLogSourceSorter = new MinHeapLogSourceSorter();
  /*
  Since the log sources are already sorted, we want to:
  1) Go through each log source and grab the first logEntry
  2) Update the logEntry with the index of the logSource where this log originated from. This will allow us
     to quickly retrieve the log again for the next logEntry
  3) Add the initial logEntries to the min-heap for sorting
  4) Process remaining entries until the heap is empty
  */
  logSources.map((logSource, index) => {
    const logEntry = logSource.pop();
    logEntry.logSourceIndex = index;
    minHeapLogSourceSorter.insert(logEntry);
  });

  // printing logic
  while (!minHeapLogSourceSorter.isEmpty()) {
    let logEntry = minHeapLogSourceSorter.getMinLogEntry(); // get earliest date log entry
    printer.print(logEntry);

    /*
    Get next log entry from that log's source. It's possible that this is the next earliest entry.
    Once added to the heap, this entry will be sorted with the existing entries.
    */
    let currentLogSource = logSources[logEntry.logSourceIndex];
    let nextLogEntry = currentLogSource.pop();

    if (nextLogEntry) {
      nextLogEntry.logSourceIndex = logEntry.logSourceIndex; // update the index of where this log entry derived from
      minHeapLogSourceSorter.insert(nextLogEntry);
    }
  }
  printer.done();

  return console.log("Sync sort complete.");
};
