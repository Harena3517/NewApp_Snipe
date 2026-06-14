import api from "../../../services/api.js"

const importServiceAsset = {

  async createCompany(name) {
    const response = await api.post("/companies", { name })
    if (response.data?.payload?.id) return response.data
    const list = await api.get("/companies", { params: { search: name, limit: 50 } })
    const found = list.data?.rows?.find(c => c.name === name)
    if (found) return { payload: { id: found.id } }
    return response.data
  },

  async createDepartment(name) {
    const response = await api.post("/departments", { name })
    if (response.data?.payload?.id) return response.data
    const list = await api.get("/departments", { params: { search: name, limit: 50 } })
    const found = list.data?.rows?.find(d => d.name === name)
    if (found) return { payload: { id: found.id } }
    return response.data
  },

  async createCategory(name) {
    const response = await api.post("/categories", { name, category_type: "asset" })
    if (response.data?.payload?.id) return response.data
    const list = await api.get("/categories", { params: { search: name, limit: 50 } })
    const found = list.data?.rows?.find(c => c.name === name)
    if (found) return { payload: { id: found.id } }
    return response.data
  },

  async createManufact(name) {
    const response = await api.post("/manufacturers", { name })
    if (response.data?.payload?.id) return response.data
    const list = await api.get("/manufacturers", { params: { search: name, limit: 50 } })
    const found = list.data?.rows?.find(m => m.name === name)
    if (found) return { payload: { id: found.id } }
    return response.data
  },

    async createStatusLabel(data) {
    const response = await api.post("/statuslabels", {
        name: data.name,
        type: "deployable",
        color: "#4CAF50",
        show_in_nav: false,
        default_label: false
    })

    if (response.data?.payload?.id) return response.data

    const list = await api.get("/statuslabels", { params: { limit: 100 } })
    const found = list.data?.rows?.find(s => s.name === data.name)
    if (found) return { payload: { id: found.id } }
    return response.data
    },

  async createModel(data) {
    const response = await api.post("/models", data)
    if (response.data?.payload?.id) return response.data
    const list = await api.get("/models", { params: { search: data.name, limit: 50 } })
    const found = list.data?.rows?.find(m => m.name === data.name)
    if (found) return { payload: { id: found.id } }
    return response.data
  },

    async createUser(data) {
    const username = data.email.split("@")[0]
    const password = "Password1234!"

    const response = await api.post("/users", {
        ...data,
        username,
        password,
        password_confirmation: password,
        activated: true
    })

    if (response.data?.payload?.id) return response.data

    const list = await api.get("/users", { params: { search: data.email, limit: 50 } })
    const found = list.data?.rows?.find(u => u.email === data.email)
    if (found) return { payload: { id: found.id } }
    return response.data
    },

  async createAsset(data) {
    const response = await api.post("/hardware", data)
    if (response.data?.payload?.id) return response.data
    const list = await api.get("/hardware", { params: { search: data.asset_tag, limit: 50 } })
    const found = list.data?.rows?.find(a => a.asset_tag === data.asset_tag)
    if (found) return { payload: { id: found.id } }
    return response.data
  },

  async checkoutAsset(assetId, userId) {
    const response = await api.post(`/hardware/${assetId}/checkout`, {
      assigned_user: userId,
      checkout_to_type: "user"
    })
    return response.data
  }

}

export default importServiceAsset