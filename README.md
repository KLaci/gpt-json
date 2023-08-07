# gpt-json

gpt-json is a library that enables interaction with OpenAI's GPT models using JSON and supports schema validation with yup. You can execute requests to retrieve specific information and get a validated result back.

## Features

- Schema defination and validation
- Message parsing
- Streaming support

# Getting started

## Install

```bash
npm install gpt-json
```

## Usage

### Initialization

```ts
import GPTJSON from 'gpt-json';
import { object, number } from 'yup';

const client = new GPTJSON({
  apiKey: 'YOUR_OPENAI_API_KEY',
});
```

### Non-streamed request

```ts
const response = await client.executeRequest({
  model: 'gpt-4',
  request: 'Give me basic data about Estonia',
  schema: object({
    population: number(),
    area: number().meta({ description: 'Area in square kilometers' }),
  }),
});

// Response:
// {
//    population: 1331000
//    area: 45339
// }
```

### Streamed request

```ts
const response = await client.executeStreamRequest({
  model: 'gpt-4',
  request: 'Top 5 tallest mountains of the world',
  schema: array(
    object({
      height: number().required(),
      name: string().required(),
    })
  ),
  // It is only called when the data can be validated with the defined schema
  onUpdate: data => {
    // Iteration 1: []
    // Iteration 2: [{ height: 8848, name: 'Mount Everest' }]
    // Iteration 3: [{ height: 8848, name: 'Mount Everest' }, { height: 8611, name: 'K2' }]
    // etc.
    console.log(data);
  },
});

// Response:
// [
//   { height: 8848, name: 'Mount Everest' },
//   { height: 8611, name: 'K2' },
//   { height: 8586, name: 'Kangchenjunga' },
//   { height: 8516, name: 'Lhotse' },
//   { height: 8462, name: 'Makalu' },
// ];
```
