// Global imports for reusable components and utilities
import React from 'react'
import {
  Search,
  RefreshCw,
  User,
  Mail,
  Building2,
  Pencil,
  Eye,
  Plus,
  Download,
  Filter,
  MessageCircle,
  Package,
  MapPin,
  Map,
  BadgeCheck,
  XCircle,
  FileText,
  Globe,
  X,
  Clock,
  Check,
  ArrowRightLeft,
  Upload,
  Send,
  Trash2,
  Settings
} from 'lucide-react'
import html2pdf from 'html2pdf.js'
import apiClient from './apiClient'
import { API_ENDPOINTS } from '../api/admin_api/api'
import quotationService from '../api/admin_api/quotationService'
import proformaInvoiceService from '../api/admin_api/proformaInvoiceService'
import templateService from '../services/TemplateService'
import DynamicTemplateRenderer from '../components/DynamicTemplateRenderer'

// Utility function for className concatenation
export const cx = (...classes) => classes.filter(Boolean).join(' ')

// Export all icons
export const Icons = {
  Search,
  RefreshCw,
  User,
  Mail,
  Building2,
  Pencil,
  Eye,
  Plus,
  Download,
  Filter,
  MessageCircle,
  Package,
  MapPin,
  Map,
  BadgeCheck,
  XCircle,
  FileText,
  Globe,
  X,
  Clock,
  Check,
  ArrowRightLeft,
  Upload,
  Send,
  Trash2,
  Settings
}

// Export services
export {
  React,
  html2pdf,
  apiClient,
  API_ENDPOINTS,
  quotationService,
  proformaInvoiceService,
  templateService,
  DynamicTemplateRenderer
}
