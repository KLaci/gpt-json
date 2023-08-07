import { array, number, object, string } from 'yup';
import GPTJSON, { generateSchemaDescription } from '../src';

const client = new GPTJSON({
  apiKey: process.env.OPENAI_API_KEY as string,
});

describe('index', () => {
  describe('first test', () => {
    // it('should work', async () => {
    //   const response = await client.executeRequest({
    //     model: 'gpt-4',
    //     request: 'Give me some basic data about Mount Everest',
    //     schema: object({
    //       height: number().required(),
    //     }),
    //   });

    //   expect(response).toEqual({
    //     height: 8848,
    //   });
    // });

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
});
