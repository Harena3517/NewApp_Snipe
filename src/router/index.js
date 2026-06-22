import { createRouter, createWebHistory } from 'vue-router'
import Dash from '../backOffice/dashboard/views/dash.vue'
import Import from '../backOffice/import/views/ImportView.vue'
import { useAuthStore } from "../backOffice/login/store/logStore.js"
import Login from '../backOffice/login/views/log.vue'
import Reset from '../backOffice/reset/views/Reset.vue'
import Setting from '../backOffice/setting/views/settingsView.vue'
import EditTicket from '../backOffice/tickets/views/EditTicket.vue'
import Ticket from '../backOffice/tickets/views/ticket.vue'
import TicketFiche from '../backOffice/tickets/views/ticketFiche.vue'
import AssetView from '../frontOffice/assets/views/assetView.vue'
import HistoryView from '../frontOffice/presentation/views/HistoryView.vue'
import Presentation from '../frontOffice/presentation/views/presentation.vue'
import FrontTicket from '../frontOffice/tickets/views/createTickets.vue'
import FicheFront from '../frontOffice/tickets/views/ticketFiche.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', component: Login },
    { path: '/reset', component: Reset },
    { path: '/import', component: Import },
    { path: '/dash', component : Dash},
    { path: '/tickets', component : Ticket},
    { path: '/tickets/:id', component : TicketFiche},
    { path: '/hardware', component : AssetView},
    { path: '/tickcreate', component : FrontTicket},
    { path: '/tickcreate/:id', component : FicheFront},
    { path: '/presentation' , component: Presentation},
    { path: '/setting' , component: Setting},
    { path: '/tickets/edit/:id' , component: EditTicket},
    { path: '/history' , component: HistoryView}
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  const pagesProtegees = ["/reset", "/import" , "/dash" , "/tickets" , "/setting" ]

  if (pagesProtegees.includes(to.path)) {
    if (!authStore.isAuthenticated) {
      next("/login")
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router