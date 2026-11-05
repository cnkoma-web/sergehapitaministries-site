import sharp from "sharp";
export async function publicationJpeg(input:Buffer){
  for(const width of [1600,1400,1200])for(const quality of [86,76,66]){
    const height=Math.round(width*9/16);
    const bytes=await sharp(input).rotate().resize(width,height,{fit:"cover"}).jpeg({quality,mozjpeg:true}).toBuffer();
    if(bytes.length<=800000)return {bytes,width,height};
  }
  throw Error("Compression JPEG supérieure à 800 Ko.");
}
