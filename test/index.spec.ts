import { array, number, object, string } from 'yup';
import GPTJSON, { generateSchemaDescription } from '../src';
import dotenv, { config } from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = new GPTJSON({
  apiKey: process.env.OPENAI_API_KEY as string,
});

describe('schema description tests', () => {
  it('basic objcect schema description', () => {
    const description = generateSchemaDescription(
      object({
        height: number().required(),
        name: string().required(),
      })
    );
    expect(description).toEqual(`{
  height: number
  name: string
}`);
  });

  it('basic array schema description', () => {
    const schema = array(string());
    const description = generateSchemaDescription(schema as any);

    expect(description).toEqual(`[
string
]`);
  });

  it('object array schema description', () => {
    const schema = array(object({ height: number() }));
    const description = generateSchemaDescription(schema as any);

    expect(description).toEqual(`[
  {
    height: number
  }
]`);
  });
  it('meta description', () => {
    const schema = object({
      height: number().meta({
        description: 'height of the mountain in meters',
      }),
    });
    const description = generateSchemaDescription(schema as any);

    expect(description).toEqual(`{
  height: number // height of the mountain in meters
}`);
  });
});

describe('stream tests', () => {
  it('stream basic test', async () => {
    let correctResponse = false;

    await client.executeStreamRequest({
      model: 'gpt-4',
      request: 'Basic data for Estonia',
      schema: object({
        height: number().required(),
        name: string().required(),
      }),
      onUpdate: data => {
        if (data.height === 318 && data.name === 'Estonia') {
          correctResponse = true;
        }
      },
    });

    expect(correctResponse).toEqual(true);
  });

  it('stream object test', async () => {
    const resp = await client.executeRequest({
      model: 'gpt-4',
      request: 'Tallest building in the world',
      schema: object({
        name: string(),
        country: string(),
      }),
    });
    console.log('🚀 ~ file: index.spec.ts:87 ~ it ~ resp:', resp);
  });

  it('stream array test', async () => {
    let correctResponse = false;

    const response = await client.executeStreamRequest({
      model: 'gpt-4',
      request: 'Top 5 tallest mountains of the world',
      schema: array(
        object({
          height: number().required(),
          name: string().required(),
        })
      ),
      onUpdate: data => {
        if (data.length === 5) {
          correctResponse = true;
        }
      },
    });
    expect(response.length).toEqual(5);
    expect(response[0]?.name).toEqual('Mount Everest');
    expect(correctResponse).toEqual(true);
  });
});
