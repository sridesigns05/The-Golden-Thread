import type { MotifId, StoryId } from './index';

// Everything the Golden Thread Passport shows. Built from a finished journey; nothing here is invented.
export type PassportData =
  | {
      variant: 'solo';
      startId: StoryId;
      destinationId: StoryId;
      visitedIds: StoryId[]; // in order, start to destination
      threadsWoven: number;
      moves: number;
      shortestMoves: number;
    }
  | {
      variant: 'shared';
      playerAStoryId: StoryId;
      playerBStoryId: StoryId;
      motifs: MotifId[];
      // Only messages whose authors chose to print them on the card
      messages: Array<{ from: 'first' | 'second'; text: string }>;
      // A real, saved journey link; absent when the journey is not stored on the server
      shareUrl?: string;
    };
