export const updateObject = (oldObject, updatedProperties) => {
    return {
        ...oldObject,
        ...updatedProperties
    };
};

export const checkValidity = (value, rules) => {
    if (!rules) {
        return true;
    }
    let isValid = true;
    if (rules.required) {
        isValid = isValid && value.trim() !== '';
    }
    if (rules.minLength) {
        isValid = isValid && value.length >= rules.minLength;
    }
    if (rules.maxLength) {
        isValid = isValid && value.length <= rules.maxLength;
    }
    if (rules.matches) {
        isValid = isValid && rules.matches.test(value);
    }
    if (rules.isEmail) {
        const pattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        isValid = isValid && pattern.test(value);
    }
    if (rules.isNumeric) {
        const pattern = /^\d+$/;
        isValid = pattern.test(value) && isValid
    }
    return isValid;
};