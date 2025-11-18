import { service as authService } from '../services/auth.services.js'

export const controller = {
    async register (req, res) {
        try {
            const result = await authService.register(req, res)
            res.status(parseInt(result.code)).json(result)
        } catch (error) {
            console.log(error)
        }
    },
    async login (req, res) {
        try {
            const result = await authService.login(req, res)
            res.status(parseInt(result.code)).json(result)
        } catch (error) {
            console.log(error)
        }
    }
}