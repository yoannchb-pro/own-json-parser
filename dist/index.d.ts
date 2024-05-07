type JSONPrimitif = string | number | boolean | null;
type JSONObject = {
    [key: string]: JSONResult;
};
type JSONArray = JSONResult[];
type JSONResult = JSONObject | JSONArray | JSONPrimitif;
declare const JSONParser: (str: string | number | boolean) => JSONResult;
export { JSONParser as default };
