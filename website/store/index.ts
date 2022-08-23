/**
 * State for navigating the repository
 */
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Directory } from "../components/types";

interface InitializeAction {
  repository: Directory;
}

interface SelectNewEntryAction {
  directoryIndex: number;
  newEntryIndex: number;
  length: number;
  isDirectory: boolean;
}

interface Entry {
  index: number;
  length: number;
}

const repoSlice = createSlice({
  name: "repository",
  initialState: {
    // Stores the indices of the selected entry in each
    // nested directory. For instance if we have
    // foo > bar > baz where bar is the 4th entry in foo
    // and baz is the 2nd entry in bar, we'd have
    // selectedEntries: [4, 2]
    selectedEntries: [] as Entry[],
    // The directory that is currently selected for keyboard
    // purposes
    selectedDirectory: 0,
    directoryCount: 0,
    isInitialized: false,
  },
  reducers: {
    initialize: (state, action: PayloadAction<InitializeAction>) => {
      const index = action.payload.repository.object.entries.findIndex(
        (e) => e.name === "README.md"
      );
      const length = action.payload.repository.object.entries.length;

      state.selectedEntries = [{ index: index || 0, length }];
      state.isInitialized = true;
    },
    selectNewEntry: (state, action: PayloadAction<SelectNewEntryAction>) => {
      state.selectedEntries = state.selectedEntries.slice(
        0,
        action.payload.directoryIndex
      );
      state.selectedEntries.push({
        index: action.payload.newEntryIndex,
        length: action.payload.length,
      });

      state.selectedDirectory = action.payload.directoryIndex;
    },
    incrementDirectory: (state) => {
      state.selectedDirectory = state.selectedDirectory + 1;
    },
    decrementDirectory: (state) => {
      state.selectedDirectory = Math.max(state.selectedDirectory - 1, 0);
    },
    incrementEntry: (state) => {
      const index = state.selectedDirectory;

      state.selectedEntries[index].index =
        (state.selectedEntries[index].index + 1) %
        state.selectedEntries[index].length;
    },
    decrementEntry: (state) => {
      const index = state.selectedDirectory;

      state.selectedEntries[index].index =
        (state.selectedEntries[index].index +
          state.selectedEntries[index].length -
          1) %
        state.selectedEntries[index].length;
    },
  },
});

export const {
  initialize,
  selectNewEntry,
  incrementDirectory,
  decrementDirectory,
  incrementEntry,
  decrementEntry,
} = repoSlice.actions;

export const store = configureStore({ reducer: { repo: repoSlice.reducer } });

export type RootState = ReturnType<typeof store.getState>;
