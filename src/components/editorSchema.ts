import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { MermaidBlock } from "./MermaidBlock";

// Our schema with block specs, which contain the configs and implementations for
// blocks that we want our editor to use.
export const editorSchema = BlockNoteSchema.create({
  blockSpecs: {
    // Adds all default blocks.
    ...defaultBlockSpecs,
    // Adds the Mermaid block.
    mermaid: MermaidBlock,
  },
});

// Type for the editor instance
export type EditorType = typeof editorSchema.BlockNoteEditor;
