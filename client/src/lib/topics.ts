// Central topic config. Every feature reads from here and the API client passes
// `topic` to the backend, so adding a topic is just adding an entry below.

export interface Topic {
  id: string;
  /** Label shown in the UI. */
  label: string;
  /** The exact topic string sent to the backend prompts. */
  value: string;
}

export const TOPICS: Topic[] = [
  {
    id: "how-neural-networks-learn",
    label: "How Neural Networks Learn",
    value: "How Neural Networks Learn",
  },
  {
    id: "how-llms-work",
    label: "How Large Language Models Work",
    value: "How Large Language Models Work",
  },
  // Add more topics here later — the dropdown, prompts, and all features pick
  // them up automatically (the backend uses generic prompts for non-flagship
  // topics).
];

export const DEFAULT_TOPIC = TOPICS[0].value;
