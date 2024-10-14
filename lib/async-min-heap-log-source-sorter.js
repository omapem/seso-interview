"use strict";

/* 
This class implements an asynchronous min-heap data structure for sorting log entries based on their timestamps.
It uses promises to handle asynchronous operations.
*/
module.exports = class AsyncMinHeapLogSourceSorter {
  constructor() {
    this.logEntries = [];
  }

  // Determines if the heap is empty (synchronously)
  isEmpty() {
    return this.logEntries.length === 0;
  }

  // Compares two timestamps and returns the difference in milliseconds (synchronously)
  compareTimestamps(date1, date2) {
    return date1.getTime() - date2.getTime();
  }

  //  Used for rearranging elements during heap operations (synchronously)
  swap(i, j) {
    [this.logEntries[i], this.logEntries[j]] = [
      this.logEntries[j],
      this.logEntries[i],
    ];
  }

  /*
  Restores the heap property by moving the element at index i up
  the heap until it is in the correct position (asynchronously)
  */
  bubbleUp(i) {
    return new Promise((resolve) => {
      let parentIndex = Math.floor((i - 1) / 2);
      while (
        parentIndex >= 0 &&
        this.compareTimestamps(
          this.logEntries[i].date,
          this.logEntries[parentIndex].date
        ) < 0
      ) {
        this.swap(i, parentIndex);
        i = parentIndex;
        parentIndex = Math.floor((i - 1) / 2);
      }
      resolve();
    });
  }

  /*
  Restores the heap property by moving the element at index i down
  the heap until it is in the correct position (asynchronously)
  */
  bubbleDown(i) {
    return new Promise((resolve) => {
      let smallestIndex = i;
      let leftChildIndex = i * 2 + 1;
      let rightChildIndex = i * 2 + 2;

      if (
        leftChildIndex < this.logEntries.length &&
        this.compareTimestamps(
          this.logEntries[leftChildIndex].date,
          this.logEntries[smallestIndex].date
        ) < 0
      ) {
        smallestIndex = leftChildIndex;
      }

      if (
        rightChildIndex < this.logEntries.length &&
        this.compareTimestamps(
          this.logEntries[rightChildIndex].date,
          this.logEntries[smallestIndex].date
        ) < 0
      ) {
        smallestIndex = rightChildIndex;
      }

      if (smallestIndex !== i) {
        this.swap(i, smallestIndex);
        this.bubbleDown(smallestIndex).then(resolve);
      } else {
        resolve();
      }
    });
  }

  // Adds a new element to the heap and maintains the min-heap property (asynchronously)
  insert(logEntry) {
    return new Promise((resolve) => {
      this.logEntries.push(logEntry);
      this.bubbleUp(this.logEntries.length - 1).then(resolve);
    });
  }

  // Returns the log entry with the earliest timestamp (asynchronously)
  getMinLogEntry() {
    return new Promise((resolve) => {
      if (this.logEntries.length === 0) {
        resolve(null);
        return;
      }

      const minLogEntry = this.logEntries[0];
      this.logEntries[0] = this.logEntries[this.logEntries.length - 1]; // Replace with the last element
      this.logEntries.pop();
      this.bubbleDown(0).then(() => resolve(minLogEntry));
    });
  }

  // Prints the heap entries in chronological order (synchronous).
  printHeapInOrder() {
    console.log("Heap:");
    const heapCopy = [...this.logEntries]; // Create a copy to avoid modifying the original heap
    const sortedHeap = heapCopy.sort((a, b) => a.date - b.date); // Sort the copy by date

    for (let i = 0; i < sortedHeap.length; i++) {
      console.log(
        `  ${i}: ${sortedHeap[i].date.toISOString()} - ${sortedHeap[i].msg}`
      );
    }
  }
};
