import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Filter, X, Search, TrendingUp, TrendingDown, Tag, CreditCard, Calendar, CheckCircle2, Clock } from 'lucide-react'
import { FinanceCategory } from '@/types/finance'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/use-debounce'
import { useI18n } from '@/hooks/use-i18n'
import { AnimatePresence, motion } from 'framer-motion'

interface TransactionFiltersProps {
  categories: FinanceCategory[]
  onFilterChange: (filters: FilterState) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideButton?: boolean
}

export interface FilterState {
  search: string
  type: 'all' | 'income' | 'expense'
  category: string
  status: 'all' | 'pending' | 'completed'
  paymentMethod: string
  dateFrom: string
  dateTo: string
}

export const TransactionFilters = ({
  categories,
  onFilterChange,
  open,
  onOpenChange,
  hideButton = false,
}: TransactionFiltersProps) => {
  const { t } = useI18n()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    category: 'all',
    status: 'all',
    paymentMethod: 'all',
    dateFrom: '',
    dateTo: '',
  })

  // Focar no input quando expandir
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchExpanded])

  // Fechar busca quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchExpanded && filters.search === '' && searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSearchExpanded, filters.search])

  // Debounce apenas para busca (search)
  const debouncedSearch = useDebounce(filters.search, 300)

  // Notificar mudanças de filtros (exceto search que usa debounce)
  useEffect(() => {
    onFilterChange({ ...filters, search: debouncedSearch })
  }, [debouncedSearch, filters.type, filters.category, filters.status, filters.paymentMethod, filters.dateFrom, filters.dateTo])

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      search: '',
      type: 'all',
      category: 'all',
      status: 'all',
      paymentMethod: 'all',
      dateFrom: '',
      dateTo: '',
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'search' && value !== 'all' && value !== ''
  ).length

  return (
    <div className="flex gap-2 items-center">
      {/* Busca Expansível - Estilo Notion */}
      <AnimatePresence mode="wait">
        {isSearchExpanded ? (
          <motion.div
            key="search-expanded"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative flex-1 min-w-0"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchInputRef}
              placeholder={t('finance.filters.searchPlaceholder')}
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-9 pr-8 h-8 w-full"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsSearchExpanded(false)
                  updateFilter('search', '')
                }
              }}
            />
            {filters.search && (
              <button
                onClick={() => {
                  updateFilter('search', '')
                  searchInputRef.current?.focus()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="search-collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearchExpanded(true)}
              className="h-8 w-8 p-0"
            >
              <Search className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão Filtros - Mobile */}
      {!hideButton && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onOpenChange?.(!open)}
          className="h-8 gap-2 px-3"
        >
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">{t('finance.filters')}</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Sheet de Filtros - Estilo Notion */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0">
          <SheetHeader className="px-4 py-3 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t('finance.filters')}
              </SheetTitle>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-muted-foreground">
                  {t('finance.filters.clear')}
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="divide-y divide-border">
            {/* Tipo - Inline estilo Notion */}
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2 w-20 flex-shrink-0">
                {filters.type === 'income' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : filters.type === 'expense' ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">{t('finance.filters.type')}</span>
              </div>
              <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                <SelectTrigger className="flex-1 border-0 bg-transparent h-8 focus:ring-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('finance.filters.all')}</SelectItem>
                  <SelectItem value="income">{t('finance.filters.income')}</SelectItem>
                  <SelectItem value="expense">{t('finance.filters.expense')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoria - Inline */}
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2 w-20 flex-shrink-0">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t('finance.filters.category')}</span>
              </div>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger className="flex-1 border-0 bg-transparent h-8 focus:ring-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('finance.filters.allCategories')}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.icon && <span className="mr-1">{cat.icon}</span>}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status - Inline */}
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2 w-20 flex-shrink-0">
                {filters.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : filters.status === 'pending' ? (
                  <Clock className="h-4 w-4 text-yellow-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">{t('finance.filters.status')}</span>
              </div>
              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger className="flex-1 border-0 bg-transparent h-8 focus:ring-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('finance.filters.all')}</SelectItem>
                  <SelectItem value="completed">{t('finance.filters.completed')}</SelectItem>
                  <SelectItem value="pending">{t('finance.filters.pending')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pagamento - Inline */}
            <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2 w-20 flex-shrink-0">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t('finance.filters.payment')}</span>
              </div>
              <Select value={filters.paymentMethod} onValueChange={(value) => updateFilter('paymentMethod', value)}>
                <SelectTrigger className="flex-1 border-0 bg-transparent h-8 focus:ring-0 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('finance.filters.all')}</SelectItem>
                  <SelectItem value="money">{t('finance.filters.money')}</SelectItem>
                  <SelectItem value="card">{t('finance.filters.card')}</SelectItem>
                  <SelectItem value="pix">{t('finance.filters.pix')}</SelectItem>
                  <SelectItem value="transfer">{t('finance.filters.transfer')}</SelectItem>
                  <SelectItem value="other">{t('finance.filters.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Período - Inline */}
            <div className="px-4 py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t('finance.filters.date')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pl-6">
                <div>
                  <label className="text-[10px] text-muted-foreground">{t('finance.filters.dateFrom')}</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">{t('finance.filters.dateTo')}</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros ativos */}
          {activeFiltersCount > 0 && (
            <div className="px-4 py-3 border-t bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {activeFiltersCount} {t('finance.filters.active')}
                </span>
                <Button variant="outline" size="sm" onClick={clearFilters} className="h-7 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  {t('finance.filters.clearAll')}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
