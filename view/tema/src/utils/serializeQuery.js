const serialize = ($query) => {
    var retornar = [];
    
    Object.keys($query).forEach((item, index) => {
        const dadosQuery = $query[item];
        retornar[index] = []
        Object.keys(dadosQuery).forEach((queryDados) => {
            const valor = dadosQuery[queryDados];

            retornar[index].push(`query[${item}][${queryDados}]=${valor}`);
        })
        
        retornar[index] = retornar[index].join('&')
    })
    
    return retornar.join('&');
}

export default serialize;