// Utility class for number to words conversion
export class NumberToWords {
  static ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  static teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  static tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  static scales = ['', 'Thousand', 'Lakh', 'Crore']

  static convert(num) {
    if (!num || num === 0) return 'Zero'

    const convertHundreds = (n) => {
      let result = ''
      if (n > 99) {
        result += this.ones[Math.floor(n / 100)] + ' Hundred '
        n %= 100
      }
      if (n > 19) {
        result += this.tens[Math.floor(n / 10)] + ' '
        n %= 10
      } else if (n > 9) {
        result += this.teens[n - 10] + ' '
        return result
      }
      if (n > 0) {
        result += this.ones[n] + ' '
      }
      return result
    }

    let result = ''
    let scaleIndex = 0
    let remainingNum = num
    while (remainingNum > 0) {
      if (remainingNum % 1000 !== 0) {
        const chunk = remainingNum % 1000
        const chunkWords = convertHundreds(chunk)
        if (chunkWords.trim()) {
          result = chunkWords + this.scales[scaleIndex] + ' ' + result
        }
      }
      remainingNum = Math.floor(remainingNum / 1000)
      scaleIndex++
    }
    return result.trim()
  }
}
