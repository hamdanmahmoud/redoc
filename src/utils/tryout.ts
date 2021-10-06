import * as _ from 'lodash';

const getUpdatedArrayFromObject = (object, arrayFieldName, newValue, indexInArray) => {
    if (!object || !object[arrayFieldName]) object[arrayFieldName] = [];
    const newArray = object[arrayFieldName];
    newArray[indexInArray] = newValue;
    return newArray;
}

const getNestedChange = (object, fieldName, fieldValue, indexInArray, parentsCopy: string[]) => {
    if (parentsCopy.length === 0) throw new Error('Cannot traverse nested objects if no parents specified');

    const objectCopy = object;
    while (parentsCopy && parentsCopy.length) {
        const parent = parentsCopy.shift() || 0;
        objectCopy[parent] = parentsCopy.length
            ? objectCopy[parent] || {}
            : {
                ...objectCopy[parent],
                [fieldName]: indexInArray === undefined ? fieldValue : getUpdatedArrayFromObject(objectCopy[parent] || {}, fieldName, fieldValue, indexInArray)
            };
    }
    return object;
}

export const getObjectChange = (object, name, value, indexInArray, parents: string[] = []) => {
    return parents.length === 0
        ? {
            [name]: indexInArray !== undefined ? getUpdatedArrayFromObject(object, name, value, indexInArray) : value
        }
        : getNestedChange(object, name, value, indexInArray, parents || []);
}

export const getCleanRequest = (request) => {
    const cleanEmptyFields = (obj) => {
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
  
    return {
        ...request,
        queryParams: cleanEmptyFields(request.queryParams),
        pathParams: cleanEmptyFields(request.pathParams),
        cookieParams: cleanEmptyFields(request.cookieParams),
        headers: cleanEmptyFields(request.headers)
    }
} 