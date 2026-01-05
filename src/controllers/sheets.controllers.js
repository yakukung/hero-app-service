import { service as sheetsService } from '../services/sheets.services.js'

export const controller = {
    async create (req, res) {
        try {
            const result = await sheetsService.create(req, res)
            res.status(parseInt(result.code)).json(result)
        } catch (error) {
            console.log(error)
        }
    },
}