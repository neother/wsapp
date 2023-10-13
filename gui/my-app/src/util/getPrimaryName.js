

const getPrimaryName = (name,names)=>{
    // console.log('77'+name)
    // console.log("77777"+names)
    for(let i=0;i<=names.length;i++){
        try{
            if (names[i].toLowerCase()
                .split('.')[1]
                .startsWith(name.toLowerCase())){
                console.log("getPrimaryName:"+names[i])
                return names[i]
            }
        }
        catch (e) {
            console.log(e)

        }

    }
    
}
module.exports = getPrimaryName

// export const time2 =  new Date()

// module.exports.default = {tqsdkg}