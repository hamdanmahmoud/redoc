import * as _ from 'lodash';

import { RequestBodyPayloadType } from '../components';

const appendPathParamsToPath = (path: string, pathParams: Object): string => {
    const entries = Object.entries(pathParams);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      path = path.replace(`{${key}}`, value);
    }
    return path;
}
  
const appendQueryParamsToPath = (path: string, queryParams: Object): string => {
    const entries = Object.entries(queryParams);
    let paramsSuffix = '';
  
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      paramsSuffix += paramsSuffix === '' ? `${key}=${value}`: `&${key}=${value}`;
    }
    return paramsSuffix === '' ? path : `${path}?${paramsSuffix}`;
}

export const appendParamsToPath = (path: string, pathParams: Object, queryParams: Object): string => {
    path = appendPathParamsToPath(path, pathParams);
    path = appendQueryParamsToPath(path, queryParams);
    return path;
}
  
export const setCookieParams = (cookieParams: Object): void => {
    const entries = Object.entries(cookieParams);
    const cookies: string[] = [];
    for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        cookies.push(`${key}=${value}`)
    }
    document.cookie = cookies.join(';');
}

/**
 * Cleans array from any falsy values
 * @param arr Array reference that needs to be cleaned
 * @returns Reference to the initial array after undergoing cleanup
 */
const getCleanArray = (arr) => {
    let i = 0;
    while (i < arr.length) {
        if (!arr[i]) { // TODO: adapt, as this might be a source of unexpected bugs if array items are boolean
        arr.splice(i, 1);
        } else {
        ++i;
        }
    }
    return arr;
}

export const getCleanObject = (obj) => {
    if (!obj || typeof(obj) !== 'object' || Array.isArray(obj)) return obj;

    const decorate = (obj) => {
      return {
        ...obj,
        removeUndefinedFields: function removeUndefinedFields () {
          const entries = Object.entries(this);
          if (entries.length === 0) return this;

          entries.forEach(
            ([key, value]) => {
              this[key] === undefined 
              ? delete this[key]
              : typeof(this[key]) === 'object' ? removeUndefinedFields.bind(this[key])() : value
            }
          );
          return this;
        },
        cleanArrayFields: function cleanArrayFields () {
          const entries = Object.entries(this);
          if (entries.length === 0) return this;

          entries.forEach(
            ([key, value]) => {
              this[key] = Array.isArray(value) 
              ? getCleanArray(value)
              : typeof(this[key]) === 'object' ? cleanArrayFields.bind(this[key])() : value
            }
          )
          return this;
        },
        omitFunctionFields: function () {
          return _.omitBy(this, _.isFunction);
        }
      }
    }

    const decoratedObject = decorate(obj);

    return decoratedObject
      .removeUndefinedFields()
      .cleanArrayFields()
      .omitFunctionFields();
}

export const mapStatusCodeToType = (code: number) => {
    switch (true) {
      case (_.inRange(code, 100, 200)):
        return 'info';
      case (_.inRange(code, 200, 300)):
        return 'success';
      case (_.inRange(code, 300, 400)):
        return 'redirect';
      case (_.inRange(code, 400, 600)):
        return 'error';
      default:
        return '';
    }
}

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
    return newArray;
}

/**
 * 
 * @param object Reference to object that undergoes a change
 * @param fieldName Name of the field currently undergoing a change
 * @param arrayIndex Array index of the new element, if change is performed on an array, otherwise this param is undefined.
 * @param ancestors Contains all ancestors of this node (i.e. of all ancesators of the field). If field is at the top of JSON object, this list is empty.
 * @param value New value to be assigned to either object[parent0][parent1][...][fieldName] or to corresponding array element at specified index.
 * @returns Reference to initial object, after change is handled
 */
export const getUpdatedPayload = (object: RequestBodyPayloadType, fieldName, value, arrayIndex, ancestors: string[] = []) => { 
    if (!object) throw new Error(`Cannot set field ${fieldName} on ${object} object.`);

    // on root of request body
    if (ancestors.length === 0) {
      if (_.isEmpty(fieldName)) { // case when primitive value is directly on root (e.g. string, number, array)
        if (_.isEmpty(value)) {
          console.error(`Cannot set primitive value to body with body field name and value being empty.`);
        } else {
          object = value;
        }
      } else {
        object[fieldName] = arrayIndex !== undefined ? getUpdatedArrayFromObject(object, fieldName, value, arrayIndex) : value;
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
                [fieldName]: arrayIndex === undefined ? (value) : getUpdatedArrayFromObject(temp[ancestor] || {}, fieldName, value, arrayIndex)
            };
        temp = temp[ancestor];
    }

    return object;
}

/**
 * Method used for cleaning up an object from fields having empty strings as values
 * as those make no sense in some use cases, such as for request parameters (query, path etc).
 * This method esentially deletes fields that have values such as '', ' ', '     ' (i.e. empty string),
 * rest of the fields are not touched whatsoever.
 * 
 * @param obj Reference to object that will be cleaned up
 * @returns Reference to initial object, after clean up takes place
 */
const cleanEmptyFields = (obj: Object): Object => {
    const entries = Object.entries(obj);
    if (entries.length === 0) return obj;

    entries.forEach(
      ([key, value]) => {
        typeof(obj[key]) === 'string' && _.isEmpty(obj[key].replace(/\s/g, ""))
        ? delete obj[key]
        : value
      }
    );

    return obj;
}

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
export const getCleanRequest = (request) => {
    return {
        ...request,
        queryParams: cleanEmptyFields(request.queryParams),
        pathParams: cleanEmptyFields(request.pathParams),
        cookieParams: cleanEmptyFields(request.cookieParams),
        header: cleanEmptyFields(request.header),
        body: getCleanObject(request.body)
    }
}
