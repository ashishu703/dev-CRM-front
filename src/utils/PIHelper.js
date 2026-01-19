// Utility class for PI-related operations
export class PIHelper {
  static generatePiNumber() {
    const now = new Date()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    const fyStart = now.getMonth() + 1 >= 4 ? year : year - 1
    const fyEnd = (fyStart + 1).toString().slice(-2)
    const fyStartShort = fyStart.toString().slice(-2)
    const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    return `PI-${fyStartShort}${fyEnd}-${mm}${rand}`
  }

  static getDefaultFormData() {
    return {
      items: [{
        id: 1,
        description: '',
        subDescription: '',
        hsn: '',
        dueOn: new Date().toISOString().split('T')[0],
        quantity: 1,
        unit: '',
        rate: 0,
        amount: 0
      }],
      discountRate: 0,
      customer: {
        business: '',
        address: '',
        phone: '',
        gstNo: '',
        state: ''
      }
    }
  }

  static getDefaultShippingDetails() {
    return {
      lrNo: '',
      transportName: '',
      transportId: '',
      vehicleNumber: '',
      courierName: '',
      consignmentNo: '',
      byHand: '',
      postService: '',
      carrierName: '',
      carrierNumber: ''
    }
  }
}
