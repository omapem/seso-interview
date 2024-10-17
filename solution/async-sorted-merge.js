"use strict";

const MinHeapLogSourceSorter = require("../lib/min-heap-log-source-sorter");

// Print all entries, across all of the *async* sources, in chronological order.

module.exports = (logSources, printer) => {
  return new Promise(async (resolve, reject) => {
    const minHeapLogSourceSorter = new MinHeapLogSourceSorter();
    const exhaustedLogSources = new Set();

    /*
    The intent now is to pre-populate the heap until all log sources are exhausted. This can be done efficiently
    with Promise.all() and calling popAsync(). Essentially we are 'batching' the entries into the heap.
    */
    while (
      !logSources.every((logSource) => exhaustedLogSources.has(logSource))
    ) {
      // asynchronously get the earliest logEntry from every logSource
      const nextEntries = await Promise.all(
        logSources.map(async (logSource) => {
          if (!exhaustedLogSources.has(logSource)) {
            const logEntry = await logSource.popAsync();
            if (logEntry) {
              return logEntry;
            } else {
              exhaustedLogSources.add(logSource);
            }
          }
          return null;
        })
      );

      // add entries to the min-heap
      for (const logEntry of nextEntries) {
        if (logEntry) {
          minHeapLogSourceSorter.insert(logEntry);
        }
      }
    }

    // all entries are added and sorted, print
    while (!minHeapLogSourceSorter.isEmpty()) {
      let logEntry = minHeapLogSourceSorter.getMinLogEntry();
      printer.print(logEntry);
    }

    printer.done();
    resolve(console.log("Async sort complete."));
  });
};
