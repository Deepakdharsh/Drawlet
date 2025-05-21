

interface Params{
    params:{
        slug:string
    }
}

export default async function room({params}:Params){
    //get the  roomId from the back-end
    const {slug}=params
    return <div>
        {slug}  
    </div>
}