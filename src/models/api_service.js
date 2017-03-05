import mongoose from 'mongoose'

const ApiServiceSchema = new mongoose.Schema({
  name: { type: String },
  url: [{ type: String }],
  scope: []
}, { collection: 'api_services', timestamps: true })

ApiServiceSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    delete ret.createdAt
    delete ret.updatedAt
  }
})

export default mongoose.model('ApiService', ApiServiceSchema)
