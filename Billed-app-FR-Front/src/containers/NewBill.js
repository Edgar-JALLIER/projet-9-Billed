import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)

    this.fileInput = file
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    this.file = null

    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = () => {
    const allowedExtensions = ["jpg", "jpeg", "png",]
    const file = this.fileInput.files[0]
    this.file = null;
    if (!file) {
      console.error("Veuillez sélectionner un fichier.");
      return;
    }
    const filePath = this.fileInput.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    const fileExtension =fileName.split('.').pop();

    if (allowedExtensions.includes(fileExtension.toLowerCase())) {
      console.log("Fichier valide.");
      // Mettez à jour les propriétés du fichier ici si nécessaire
      this.fileName = fileName;
      this.file = file;
    } else {
      console.error("Extension de fichier non autorisée, seul les fichiers jpg, jpeg ou png sont autorisés.");
      // Réinitialisez les propriétés du fichier en cas d'extension non valide
      this.fileName = null;
      this.fileInput.value = null;
    }
  }
  createBill = async () => {
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', this.file)
    formData.append('email', email)

    
    return this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl, key)
        this.billId = key
        this.fileUrl = fileUrl
      }).catch(error => console.error(error))
  }

 
  handleSubmit = async(e) => {
    e.preventDefault()
    await this.createBill();
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    console.log('bill ID', this.billId);
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}
  
  // not need to cover this function by tests
  // updateBill = (bill) => {
  //   if (this.store) {
  //     this.store
  //     .bills()
  //     .update({data: JSON.stringify(bill), selector: this.billId})
  //     .then(() => {
  //       this.onNavigate(ROUTES_PATH['Bills'])
  //     })
  //     .catch(error => console.error(error))
  //   }
  // }
