export const stringToArray = (str: string | undefined): Array<any> => {
    let result = [];
    try {
        if(typeof str === 'string')
            result = JSON.parse(str);
    }
    catch(e) {};
    return result;
}