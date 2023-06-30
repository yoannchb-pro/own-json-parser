type JSONPrimitif = string | number | boolean | null;
type JSONObject = {
    [key: string]: JSONResult;
};
type JSONArray = JSONResult[];
type JSONResult = JSONObject | JSONArray | JSONPrimitif;
declare const _default: (str: string) => JSONResult;
export { _default as default };
