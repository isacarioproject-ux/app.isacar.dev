import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Check,
  CreditCard,
  Download,
  FileText,
  Zap,
  Crown,
  Rocket,
  Star,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/hooks/use-i18n'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

const plans = [
  {
    id: 'free',
    name: 'Grátis',
    price: 0,
    period: 'mês',
    description: 'Perfeito para começar',
    icon: Star,
    color: 'from-slate-500 to-slate-600',
    features: [
      '1 projeto',
      
      'Até 2 membros (você + 1 convidado)',
      '1 GB de armazenamento',
      'Documentos ilimitados',
      'Suporte por email',
    ],
    limits: {
      projects: 1,
      whiteboards_per_project: 3,
      members: 2,
      invited_members: 1,
      storage_gb: 1,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 65,
    period: 'mês',
    description: 'Para equipes pequenas',
    icon: Zap,
    color: 'from-primary to-primary',
    popular: true,
    features: [
      'Até 5 projetos',
      'Whiteboards ilimitados',
      'Até 10 membros (5 free + 5 pro)',
      '50 GB de armazenamento',
      'Documentos ilimitados',
      'Analytics avançado',
      'Exportação CSV/JSON',
      'Suporte prioritário',
    ],
    limits: {
      projects: 5,
      whiteboards_per_project: -1, // ilimitado
      members: 10,
      invited_members: 5,
      storage_gb: 50,
    },
  },
  {
    id: 'business',
    name: 'Business',
    price: 197,
    period: 'mês',
    description: 'Para empresas em crescimento',
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    features: [
      'Projetos ilimitados',
      'Whiteboards ilimitados',
      'Membros ilimitados',
      '200 GB de armazenamento',
      'Documentos ilimitados',
      'Branding customizado',
      'SSO (Single Sign-On)',
      'Backup automático',
      'Suporte 24/7',
    ],
    limits: {
      projects: -1, // ilimitado
      whiteboards_per_project: -1, // ilimitado
      members: -1, // ilimitado
      invited_members: -1, // ilimitado
      storage_gb: 200,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    period: 'personalizado',
    description: 'Para grandes organizações',
    icon: Rocket,
    color: 'from-emerald-500 to-green-500',
    features: [
      'Tudo do Business +',
      'Armazenamento ilimitado',
      'On-premise deployment',
      'SLA 99.9%',
      'Auditoria de segurança',
      'Treinamento personalizado',
      'Integrações customizadas',
      'Contrato anual',
    ],
    contactOnly: true,
  },
]

export default function BillingPage() {
  const { t } = useI18n()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [loadingMethods, setLoadingMethods] = useState(false)
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null)
  const [showAddMethodDialog, setShowAddMethodDialog] = useState(false)
  const [showChangeMethodDialog, setShowChangeMethodDialog] = useState(false)
  const [savingMethod, setSavingMethod] = useState(false)
  const [newMethod, setNewMethod] = useState({
    cardNumber: '',
    brand: 'visa',
    expMonth: '',
    expYear: '',
  })

  useEffect(() => {
    loadSubscription()
    loadPaymentMethods()
    loadInvoices()
  }, [])

  const loadSubscription = async () => {
    try {
      setLoadingSubscription(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error

      setSubscription(data)
    } catch (error: any) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoadingSubscription(false)
    }
  }

  const loadPaymentMethods = async () => {
    try {
      setLoadingMethods(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPaymentMethods(data ?? [])
      if (data && data.length > 0) {
        const defaultMethod = data.find((method) => method.is_default)
        setSelectedMethodId(defaultMethod ? defaultMethod.id : data[0].id)
      } else {
        setSelectedMethodId(null)
      }
    } catch (error: any) {
      toast.error(t('common.error'), {
        description: error.message || 'Erro ao carregar métodos de pagamento'
      })
    } finally {
      setLoadingMethods(false)
    }
  }

  const loadInvoices = async () => {
    try {
      setLoadingInvoices(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('billing_date', { ascending: false })

      if (error) throw error

      setInvoices(data ?? [])
    } catch (error: any) {
      toast.error(t('common.error'), {
        description: error.message || 'Erro ao carregar faturas'
      })
    } finally {
      setLoadingInvoices(false)
    }
  }

  const defaultMethod = useMemo(() => {
    if (!selectedMethodId) return null
    return paymentMethods.find((method) => method.id === selectedMethodId) ?? null
  }, [paymentMethods, selectedMethodId])

  const currentPlan = subscription?.plan_id || 'free'
  const currentPlanData = plans.find(p => p.id === currentPlan) || plans[0]

  const maskedCardNumber = (method: any) => `•••• •••• •••• ${method.last_four}`

  const handleNewMethodChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setNewMethod((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddNewMethod = async () => {
    try {
      setSavingMethod(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      if (newMethod.cardNumber.length < 12) {
        throw new Error(t('billing.cardInvalid'))
      }

      const lastFour = newMethod.cardNumber.slice(-4)

      const { error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: user.id,
          type: 'card',
          brand: newMethod.brand,
          last_four: lastFour,
          exp_month: parseInt(newMethod.expMonth),
          exp_year: parseInt(newMethod.expYear),
          is_default: paymentMethods.length === 0,
        })

      if (error) throw error

      toast.success(t('common.success'), {
        description: t('billing.methodAdded')
      })

      setShowAddMethodDialog(false)
      setNewMethod({ cardNumber: '', brand: 'visa', expMonth: '', expYear: '' })
      loadPaymentMethods()
    } catch (error: any) {
      toast.error(t('common.error'), {
        description: error.message || 'Erro ao adicionar método de pagamento'
      })
    } finally {
      setSavingMethod(false)
    }
  }

  const handleSetDefaultMethod = async (methodId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const updates = paymentMethods.map((method) => ({
        id: method.id,
        user_id: user.id,
        is_default: method.id === methodId,
      }))

      const { error } = await supabase
        .from('payment_methods')
        .upsert(updates)

      if (error) throw error

      toast.success(t('common.success'), {
        description: t('billing.methodUpdated')
      })

      setSelectedMethodId(methodId)
      setShowChangeMethodDialog(false)
      loadPaymentMethods()
    } catch (error: any) {
      toast.error(t('common.error'), {
        description: error.message || 'Erro ao atualizar método de pagamento'
      })
    }
  }

  const handleDownloadInvoice = (invoice: any) => {
    // TODO: Implementar download de fatura quando integração de pagamento estiver pronta
    toast.info('Download de faturas estará disponível após integração com gateway de pagamento')
  }

  const getDiscountedPrice = (price: number | null) => {
    if (!price) return null
    if (billingPeriod === 'yearly') {
      return Math.round(price * 12 * 0.8) // 20% de desconto anual
    }
    return price
  }

  // Loading Skeleton
  if (loadingSubscription) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Header Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>

            {/* Current Plan Skeleton */}
            <div className="p-6 rounded-lg border space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-32" />
              </div>
            </div>

            {/* Plans Grid Skeleton */}
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-lg border space-y-4"
                >
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                  <Skeleton className="h-9 w-full" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t('nav.dashboard')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/settings">{t('settings.title')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('billing.title')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Current Plan */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">{t('billing.currentPlan')}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Você está no plano {currentPlanData.name}
                </CardDescription>
              </div>
              <Badge className="w-fit">
                {currentPlanData.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-xs text-muted-foreground">{t('billing.nextCharge')}</p>
                <p className="mt-1 text-lg font-bold">
                  {subscription ? `R$ ${subscription.amount}` : 'R$ 0'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {subscription?.next_billing_date 
                    ? new Date(subscription.next_billing_date).toLocaleDateString()
                    : '-'
                  }
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-xs text-muted-foreground">{t('billing.members')}</p>
                <p className="mt-1 text-lg font-bold">
                  {subscription?.members_used || 1} / {subscription?.members_limit || 2}
                </p>
                <p className="text-xs text-muted-foreground">
                  {subscription ? Math.round((subscription.members_used / subscription.members_limit) * 100) : 50}{t('billing.percentUsed')}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-3">
                <p className="text-xs text-muted-foreground">{t('billing.storage')}</p>
                <p className="mt-1 text-lg font-bold">
                  {subscription?.storage_used_gb || 0} GB
                </p>
                <p className="text-xs text-muted-foreground">
                  {subscription ? Math.round((subscription.storage_used_gb / subscription.storage_limit_gb) * 100) : 0}% de {subscription?.storage_limit_gb || 1} GB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Period Toggle */}
        <div className="flex justify-center">
          <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as 'monthly' | 'yearly')}>
            <TabsList>
              <TabsTrigger value="monthly">{t('billing.monthly')}</TabsTrigger>
              <TabsTrigger value="yearly" className="relative">
                {t('billing.yearly')}
                {billingPeriod === 'yearly' && (
                  <Badge className="absolute -right-2 -top-2 h-5 text-xs bg-green-500">
                    -20%
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const Icon = plan.icon
            const discountedPrice = getDiscountedPrice(plan.price)
            const isCurrentPlan = plan.id === currentPlan

            return (
              <Card
                key={plan.id}
                className={cn(
                  'relative overflow-hidden',
                  plan.popular && 'border-primary/50 shadow-lg shadow-primary/20',
                  isCurrentPlan && 'ring-2 ring-primary'
                )}
              >
                {plan.popular && (
                  <div className="absolute right-3 top-3">
                    <Badge>{t('billing.popular')}</Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute left-3 top-3">
                    <Badge variant="outline" className="border-primary text-primary">
                      Atual
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className={cn(
                    'mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br shrink-0',
                    plan.color
                  )}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                  <div className="mt-3">
                    {discountedPrice !== null ? (
                      <>
                        <span className="text-2xl font-bold">
                          R$ {discountedPrice}
                        </span>
                        <span className="text-xs text-muted-foreground">/{plan.period}</span>
                        {billingPeriod === 'yearly' && plan.price && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-through">
                            R$ {plan.price * 12}
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-xl font-bold">
                        {t('billing.custom')}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <Separator className="mb-3" />
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 shrink-0 text-green-400 mt-0.5" />
                        <span className="text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="mt-4 w-full h-9" 
                    variant={plan.popular ? 'primary' : 'outline'}
                    disabled={isCurrentPlan}
                    onClick={() => {
                      if (plan.contactOnly) {
                        window.location.href = 'mailto:contato@isacar.io?subject=Interesse no Plano Enterprise'
                      }
                    }}
                  >
                    {isCurrentPlan ? 'Plano Atual' : plan.contactOnly ? 'Entrar em Contato' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t('billing.paymentMethod')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('billing.paymentMethodDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingMethods ? (
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : defaultMethod ? (
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shrink-0">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{maskedCardNumber(defaultMethod)}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('billing.expiresIn')} {String(defaultMethod.exp_month).padStart(2, '0')}/{defaultMethod.exp_year}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8" onClick={() => setShowChangeMethodDialog(true)}>
                  {t('billing.change')}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('billing.noPaymentMethods')}</p>
            )}

            <Button variant="ghost" className="w-full h-9" onClick={() => setShowAddMethodDialog(true)}>
              {t('billing.addNewMethod')}
            </Button>
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('billing.invoiceHistory')}
            </CardTitle>
            <CardDescription className="text-xs">
              {t('billing.invoiceHistoryDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInvoices ? (
              <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
            ) : invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('billing.noInvoices')}</p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {invoices.map((invoice) => (
                  <AccordionItem key={invoice.id} value={invoice.id}>
                    <AccordionTrigger className="text-sm hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{invoice.invoice_number}</span>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-xs',
                              invoice.status === 'paid' && 'border-green-500/50 text-green-400',
                              invoice.status === 'pending' && 'border-yellow-500/50 text-yellow-400',
                              invoice.status === 'failed' && 'border-red-500/50 text-red-400'
                            )}
                          >
                            {invoice.status === 'paid' ? 'Pago' : invoice.status === 'pending' ? 'Pendente' : 'Falhou'}
                          </Badge>
                        </div>
                        <span className="font-medium text-sm">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(invoice.amount))}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground">
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between">
                          <span>Data:</span>
                          <span>{new Date(invoice.billing_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Plano:</span>
                          <span>{invoice.plan_name || 'Pro'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Período:</span>
                          <span>{invoice.billing_period || 'Mensal'}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2 h-8"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          <Download className="h-3 w-3 mr-2" />
                          Baixar PDF
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('billing.faq')}</CardTitle>
            <CardDescription className="text-xs">Perguntas frequentes sobre faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger className="text-sm">{t('billing.faq1Question')}</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground">
                  {t('billing.faq1Answer')}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger className="text-sm">{t('billing.faq2Question')}</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground">
                  {t('billing.faq2Answer')}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger className="text-sm">{t('billing.faq3Question')}</AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground">
                  {t('billing.faq3Answer')}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddMethodDialog} onOpenChange={setShowAddMethodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">{t('billing.addNewMethodTitle')}</DialogTitle>
            <DialogDescription className="text-xs">{t('billing.addNewMethodDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-muted-foreground" htmlFor="cardNumber">
                {t('billing.cardNumber')}
              </label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={newMethod.cardNumber}
                onChange={handleNewMethodChange}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground" htmlFor="expMonth">
                  {t('billing.expMonth')}
                </label>
                <Input
                  id="expMonth"
                  name="expMonth"
                  placeholder="MM"
                  value={newMethod.expMonth}
                  onChange={handleNewMethodChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground" htmlFor="expYear">
                  {t('billing.expYear')}
                </label>
                <Input
                  id="expYear"
                  name="expYear"
                  placeholder="YYYY"
                  value={newMethod.expYear}
                  onChange={handleNewMethodChange}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMethodDialog(false)} className="h-9">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAddNewMethod} disabled={savingMethod} className="h-9">
              {savingMethod ? t('common.saving') : t('billing.saveMethod')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Payment Method Dialog */}
      <Dialog open={showChangeMethodDialog} onOpenChange={setShowChangeMethodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base">{t('billing.changeMethodTitle')}</DialogTitle>
            <DialogDescription className="text-xs">{t('billing.changeMethodDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-3',
                  method.id === selectedMethodId ? 'border-primary bg-primary/10' : 'border-border'
                )}
              >
                <div>
                  <p className="font-medium text-sm">{maskedCardNumber(method)}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('billing.expiresIn')} {String(method.exp_month).padStart(2, '0')}/{method.exp_year}
                  </p>
                </div>
                {method.is_default ? (
                  <Badge className="bg-primary/20 text-primary text-xs">Atual</Badge>
                ) : (
                  <Button size="sm" className="h-8" onClick={() => handleSetDefaultMethod(method.id)}>
                    Usar
                  </Button>
                )}
              </div>
            ))}
            {paymentMethods.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('billing.noPaymentMethods')}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeMethodDialog(false)} className="h-9">
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
