import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { getPackageCorreios, PackageInfo } from './correio-service';
import { redisGetAsync, redisSetAsync } from './redis-service';
const app = express();

const PORT = process.env.PORT || 8899;


const getPackage = async (pName: string) : Promise<PackageInfo> => {
    let infoStr = await redisGetAsync(pName);
    if(infoStr)
        return JSON.parse(infoStr) as PackageInfo;

    const pInfo = await getPackageCorreios(pName);
    await redisSetAsync(pName, JSON.stringify(pInfo), 60 * 5);
    return pInfo;
}


app.get('/pacote/:pacoteId', async (req : express.Request, res: express.Response) => {
    const { pacoteId } = req.params;

    const now = new Date();
    const pacoteInfo = await getPackage(pacoteId);
    const end = new Date();

    console.log(`Elapsed ${end.getTime() - now.getTime()}ms`);
    res.json(pacoteInfo);
})


app.listen(PORT, () => {
    console.log('Server started at ' + PORT);
})