module.exports = {
    autocomplete: (param)=>{
        return param && param.id ? param.id : param;
    }
}