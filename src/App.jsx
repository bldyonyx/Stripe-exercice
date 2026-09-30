import { useEffect, useState } from 'react'
import './App.css'

const FUNCTIONS_URL =
  'http://127.0.0.1:5001/stripe-exercice-maya/us-central1'

function App() {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await fetch(`${FUNCTIONS_URL}/getProduct`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors du chargement du produit')
        }

        setProduct(data)
      } catch (error) {
        console.error('Product error:', error)
      } finally {
        setLoading(false)
      }
    }

    getProduct()
  }, [])

  const handleCheckout = async () => {
    try {
      const response = await fetch(
        `${FUNCTIONS_URL}/createCheckoutSession`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            origin: window.location.origin,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du paiement')
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Checkout error:', error)
    }
  }

  if (loading) {
    return (
      <main>
        <p>Chargement...</p>
      </main>
    )
  }

  if (!product) {
    return (
      <main>
        <p>Impossible de charger le produit.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>{product.name}</h1>

      <p>
        {product.currency} {product.price.toFixed(2)}
      </p>

      <button type="button" onClick={handleCheckout}>
        Acheter
      </button>
    </main>
  )
}

export default App