/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SchoolLevel = 'SD' | 'SMP' | 'SMA';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResponse {
  quizTitle: string;
  questions: QuizQuestion[];
}
