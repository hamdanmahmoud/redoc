import * as _ from 'lodash';

const getUpdatedArrayFromObject = (object, arrayFieldName, newValue, indexInArray) => {
    if (!object || !object[arrayFieldName]) object[arrayFieldName] = [];
    const newArray = object[arrayFieldName];
    newArray[indexInArray] = newValue;
    return newArray;
}

const handleNestedChange = (object, fieldName, fieldValue, indexInArray, parents: string[], toBeRemoved?: boolean) => {
    if (parents.length === 0) throw new Error('Cannot traverse nested objects if no parents specified');

    let temp1 = object;
    if (toBeRemoved) {
        while (parents && parents.length) {
            const parent = parents.shift() || 0;
            temp1 = temp1[parent];
        }
        delete temp1[fieldName];
        return object;
    }

    let temp2 = object;
    while (parents && parents.length) {
        const parent = parents.shift() || 0;
        temp2[parent] = parents.length
            ? temp2[parent] || {}
            : {
                ...temp2[parent],
                [fieldName]: indexInArray === undefined ? (fieldValue) : getUpdatedArrayFromObject(temp2[parent] || {}, fieldName, fieldValue, indexInArray)
            };
        temp2 = temp2[parent];
    }

    return object;
}

export const getObjectChange = (object, name, value, indexInArray, parents: string[] = [], toBeRemoved?: boolean) => {
    return parents.length === 0
        ? {
            [name]: indexInArray !== undefined ? getUpdatedArrayFromObject(object, name, value, indexInArray) : value
        }
        : handleNestedChange(object, name, value, indexInArray, parents || [], toBeRemoved);
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