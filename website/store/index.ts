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
}

const repoSlice = createSlice({
  name: "repository",
  initialState: {
    // Stores the indices of the selected entry in each
    // nested directory. For instance if we have
    // foo > bar > baz where bar is the 4th entry in foo
    // and baz is the 2nd entry in bar, we'd have
    // selectedEntries: [4, 2]
    selectedEntries: [] as number[],
    // The directory that is currently selected for keyboard
    // purposes
    currentSelectedDirectory: 0,
  },
  reducers: {
    initialize: (state, action: PayloadAction<InitializeAction>) => {
      const index = action.payload.repository.object.entries.findIndex(
        (e) => e.name === "README.md"
      );

      state.selectedEntries = [index || 0];
    },
    selectNewEntry: (state, action: PayloadAction<SelectNewEntryAction>) => {
      state.selectedEntries = state.selectedEntries.slice(
        0,
        action.payload.directoryIndex
      );
      state.selectedEntries.push(action.payload.newEntryIndex);
    },
  },
});

export const { initialize, selectNewEntry } = repoSlice.actions;

export const store = configureStore({ reducer: { repo: repoSlice.reducer } });

export type RootState = ReturnType<typeof store.getState>;
