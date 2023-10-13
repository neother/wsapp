

const sliceArray = (arr,num)=>{

    let newArr = []
    for(let i=0;i<arr.length;i+=num){
        newArr.push(arr.slice(i,i+num))
    }
    // console.log(newArr)
    return newArr
}
module.exports = sliceArray

console.log(sliceArray([1,2,3,4,5],2))




// export const time2 =  new Date()

// module.exports.default = {tqsdkg}