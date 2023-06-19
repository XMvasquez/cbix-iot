import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MdAdd } from 'react-icons/md'

import './luces.css'
import apiClient from '../services/apiService'


//components
import LuzComponent from './luzComponent'

interface Luz {
  _id: number,
  estado: boolean,
  nombre: string,
  brillo: number
}

interface LucesData {
  luces: Luz[]
}

export default function Luces (): React.JSX.Element {
  const [luces, setLuces] = useState()

  useEffect(() => {
    fetchLuces().catch((error) => {
      console.log(error)
    })
  }, [])

  const fetchLuces = async (): Promise<void> => {
    try {
      const lucesData: LucesData = await apiClient.get('/luces/')
      setLuces(lucesData.luces)
      console.log('Respuesta de la API:', lucesData)
    } catch (error) {
      console.error('Error al obtener las luces:', error)
    }
  }

  return (
  <div className='Luces'>
    <span id="title">Mis Luces</span>
      <div id="lucescontainer">
        <div id="luzGrid">
          {(luces != null)
            ? luces.map((lucesObj) => (
            <LuzComponent _id={lucesObj._id} _estado={lucesObj.estado} _color={lucesObj.color} _nombre={lucesObj.nombre} _brillo={lucesObj.brillo}/>
            ))
            : null}
        </div>
        <NavLink activeClassName="active" to="/luces/new" className="lucesNew">
          <div className="addBoton">
            <MdAdd size={42} />
          </div>
        </NavLink>
      </div>
      </div>)
}
