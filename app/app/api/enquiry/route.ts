// Deliberately fail closed. Implement the approved destination and durable spam controls before enabling forms.
export async function POST(){return Response.json({accepted:false,message:'Enquiries are not connected yet. No details have been accepted.'},{status:503,headers:{'Cache-Control':'no-store'}});}
