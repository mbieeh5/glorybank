export default function Loading(){
    return(
    <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg mb-4">Loading...</p>
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    )
}