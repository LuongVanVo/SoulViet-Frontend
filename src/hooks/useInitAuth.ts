import { useEffect } from 'react'
import { apiService } from '../services/mockData'
import { useAuthStore } from '../store/authStore'

export const useInitAuth = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const setLoading = useAuthStore((state) => state.setLoading)

  useEffect(() => {
    let isActive = true

    setLoading(true)

    apiService
      .getCurrentUser()
      .then((user) => {
        if (isActive) {
          setUser(user)
        }
      })
      .catch(() => {
        if (isActive) {
          setUser(null)
        }
      })

    return () => {
      isActive = false
    }
  }, [setLoading, setUser])
}