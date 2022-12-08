import { omitBy, inRange, isEmpty, isFunction } from 'lodash';

import { RequestBodyPayloadType } from '../components';
import { OperationModel } from '../services/models/Operation';

const appendPathParamsToPath = (path: string, pathParams: Record<string, string>): string => {
  const entries = Object.entries(pathParams);
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    path = path.replace(`{${key}}`, encodeURIComponent(value));
  }
  return path;
};

/**
 * e.g. [
 *  ["a", "b"],
 *  ["c", "d"]
 * ]
 * becomes "a=b&c=d"
 */
const entriesToQueryString = (entries): string => {
  let queryString = '';
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    queryString +=
      queryString === ''
        ? `${key}=${encodeURIComponent(value)}`
        : `&${key}=${encodeURIComponent(value)}`;
  }
  return queryString;
};

const appendQueryParamsToPath = (path: string, queryParams: Record<string, string>): string => {
  const entries = Object.entries(queryParams);
  const paramsSuffix = entriesToQueryString(entries);
  return paramsSuffix === '' ? path : `${path}?${paramsSuffix}`;
};

/**
 *
 * @returns equivalent params, with dictionary params converted to string params
 * by spreading them on root (or we could say collapse nested map/dictionary params)
 * e.g.
 * {
 *  someFilter: "location%3D%3DSingapore",
 *  reqParam: {
 *    filter: "age%3D%3D7",
 *    scope: true
 *  }
 * }
 * becomes
 * {
 *  someFilter: "location%3D%3DSingapore",
 *  filter: "age%3D%3D7",
 *  scope: true
 * }
 */
const spreadNestedParams = params => {
  if (isEmpty(params)) return params;
  const allParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === null) return;
    const isObjectParam = typeof value === 'object';
    if (isObjectParam) {
      Object.entries(value as object)?.forEach(([nestedParamKey, nestedParamValue]) => {
        allParams[nestedParamKey] = nestedParamValue;
      });
    } else {
      allParams[key] = value;
    }
  });
  return allParams;
};

export const appendParamsToPath = (
  path: string,
  pathParams: Record<string, string>,
  queryParams: Record<string, string>,
): string => {
  path = appendPathParamsToPath(path, pathParams);
  path = appendQueryParamsToPath(path, spreadNestedParams(queryParams));
  return path;
};

export const setCookieParams = (cookieParams: Record<string, string>): void => {
  const entries = Object.entries(cookieParams);
  const cookies: string[] = [];
  for (let i = 0; i < entries.length; i++) {
    const [key, value] = entries[i];
    cookies.push(`${key}=${value}`);
  }
  document.cookie = cookies.join(';');
};

/**
 * Cleans array from any falsy values
 * @param arr Array reference that needs to be cleaned
 * @returns Reference to the initial array after undergoing cleanup
 */
const getCleanArray = arr => {
  let i = 0;
  while (i < arr.length) {
    if (!arr[i]) {
      // TODO: adapt, as this might be a source of unexpected bugs if array items are boolean
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
};

export const getCleanObject = obj => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;

  const decorate = obj => {
    return {
      ...obj,
      removeUndefinedFields: function removeUndefinedFields() {
        const entries = Object.entries(this);
        if (entries.length === 0) return this;

        entries.forEach(([key, value]) => {
          this[key] === undefined
            ? delete this[key]
            : typeof this[key] === 'object'
            ? removeUndefinedFields.bind(this[key])()
            : value;
        });
        return this;
      },
      cleanArrayFields: function cleanArrayFields() {
        const entries = Object.entries(this);
        if (entries.length === 0) return this;

        entries.forEach(([key, value]) => {
          this[key] = Array.isArray(value)
            ? getCleanArray(value)
            : typeof this[key] === 'object'
            ? cleanArrayFields.bind(this[key])()
            : value;
        });
        return this;
      },
      omitFunctionFields: function () {
        return omitBy(this, isFunction);
      },
    };
  };

  const decoratedObject = decorate(obj);
  return decoratedObject.removeUndefinedFields().cleanArrayFields().omitFunctionFields();
};

export const mapStatusCodeToType = (code: number) => {
  switch (true) {
    case inRange(code, 100, 200):
      return 'info';
    case inRange(code, 200, 300):
      return 'success';
    case inRange(code, 300, 400):
      return 'redirect';
    case inRange(code, 400, 600):
      return 'error';
    default:
      return '';
  }
};

/**
 * Method updates an array field inside an object, given an
 * index at which this (possibly new) element is found in our array,
 * alongisde a value that will be assigned at this specified index.
 *
 * @param object Reference to object containing an array field
 * @param fieldName Name of the array field
 * @param index Array index of the new element which object[fieldName] includes
 * @param value New value to assign to object[fieldName][index]
 * @returns Reference to (possibly just created) array i.e. object[fieldName]
 */
const getUpdatedArrayFromObject = (object, fieldName, value, index) => {
  if (!object[fieldName]) object[fieldName] = []; // fieldName undefined, so define it
  const newArray = object[fieldName];
  newArray[index] = value;
  return getCleanArray(newArray); // assumes UI input index === state array index, see RemovableInput in ArrayForm
};

/**
 *
 * @param object Reference to object that undergoes a change
 * @param fieldName Name of the field currently undergoing a change
 * @param arrayIndex Array index of the new element, if change is performed on an array, otherwise this param is undefined.
 * @param ancestors Contains all ancestors of this node (i.e. of all ancesators of the field). If field is at the top of JSON object, this list is empty.
 * @param value New value to be assigned to either object[parent0][parent1][...][fieldName] or to corresponding array element at specified index.
 * @returns Reference to initial object, after change is handled
 */
export const getUpdatedObject = (
  object: RequestBodyPayloadType,
  fieldName,
  value,
  arrayIndex,
  ancestors: string[] = [],
) => {
  if (!object) throw new Error(`Cannot set field ${fieldName} on ${object} object.`);

  // on root of object
  if (ancestors.length === 0) {
    if (isEmpty(fieldName)) {
      // case when primitive value is directly on root (e.g. string, number, array)
      if (isEmpty(value)) {
        console.error(
          `Cannot set primitive value to body with body field name and value being empty.`,
        );
      } else {
        object = value;
      }
    } else {
      object[fieldName] =
        arrayIndex !== undefined
          ? getUpdatedArrayFromObject(object, fieldName, value, arrayIndex)
          : value;
    }
    return object;
  }

  // nested change
  let temp = object;
  while (ancestors && ancestors.length) {
    const ancestor = ancestors.shift() || 0;
    temp[ancestor] = ancestors.length
      ? temp[ancestor] || {}
      : {
          ...temp[ancestor],
          [fieldName]:
            arrayIndex === undefined
              ? value
              : getUpdatedArrayFromObject(temp[ancestor] || {}, fieldName, value, arrayIndex),
        };
    temp = temp[ancestor];
  }

  return object;
};

/**
 * Method used for cleaning up an object from fields having empty strings or empty objects as values
 * as those make no sense in some use cases, such as for request parameters (query, path etc).
 * This method esentially deletes fields that have values such as '', ' ', '     ' (i.e. empty string),
 * and arrays, rest of the fields are not touched whatsoever.
 *
 * @param obj Reference to object that will be cleaned up
 * @returns Reference to initial object, after clean up takes place
 */
const cleanEmptyFields = (obj: Record<string, any>): Record<string, any> => {
  const entries = Object.entries(obj);
  if (entries.length === 0) return obj;

  entries.forEach(([key, value]) => {
    const isEmptyString = typeof obj[key] === 'string' && isEmpty(obj[key].replace(/\s/g, ''));
    const isEmptyObject = typeof obj[key] === 'object' && obj[key] !== null && isEmpty(obj[key]);
    isEmptyString || isEmptyObject
      ? delete obj[key]
      : Array.isArray(value)
      ? getCleanArray(value)
      : value;
  });

  return obj;
};

/**
 * Pre-flight request cleanup
 * Method makes use of cleanEmptyFields method, cleaning up
 * all request parameters in which having empty strings or
 * multi-space strings makes as parameters makes no sense,
 * such as in the case of query, path params etc, as well as
 * the request body.
 *
 * @param request Reference to request object for which params will be cleaned up
 * @returns New request object, after cleaning up some of its object fields
 */
export const getCleanRequest = request => {
  return {
    ...request,
    queryParams: cleanEmptyFields(request.queryParams),
    pathParams: cleanEmptyFields(request.pathParams),
    cookieParams: cleanEmptyFields(request.cookieParams),
    header: cleanEmptyFields(request.header),
    body: getCleanObject(request.body),
  };
};

/**
 *
 * @param fields Fields objects as input
 * @returns Equivalent fields, with name, empty ancestors list (as there is no nesting in params, only in body), and whether by default field would be valid
 */
export const requiredParamsToFields = fields => {
  return (
    fields?.map(({ required, name }) => ({
      fieldName: name,
      ancestors: [],
      valid: !required,
    })) || []
  );
};

export interface RequiredField {
  fieldName: string;
  ancestors: string[];
  valid: boolean;
}

/**
 *
 * @param operation Reference to operation object that owns the fields
 * @returns All required fields, including params and body fields, in a {fieldName, ancestors, valid} object format
 */
export const getRequiredFields = (operation: OperationModel): RequiredField[] => {
  const requiredFields: any[] = [];
  const fieldsTraversal = (node, ancestors, depth = 0) => {
    if (!node || !ancestors) return [];
    const { schema, name, required } = node;
    if (required) {
      requiredFields.push({
        fieldName: name,
        ancestors,
        valid: false,
      });
    }
    const { oneOf, fields, activeOneOf, items } = schema;
    const hasDiscriminator: boolean = !!oneOf;
    const hasOwnFields: boolean = fields && fields.length !== 0;
    const hasOwnItems: boolean = !!items;

    const children = hasDiscriminator
      ? oneOf![activeOneOf].fields
      : hasOwnFields
      ? fields
      : hasOwnItems
      ? items?.fields
      : [];
    children?.forEach(child =>
      fieldsTraversal(child, depth !== 0 ? [...ancestors, name] : [...ancestors], depth + 1),
    );
  };
  fieldsTraversal(operation.requestBody?.content?.active, []);
  return [...requiredParamsToFields(operation?.parameters), ...requiredFields];
};

export const anyInvalidRequiredField = requiredFields => {
  return requiredFields?.some(field => !field.valid);
};
