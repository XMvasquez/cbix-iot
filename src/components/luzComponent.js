import React, { useRef, useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { MdLightbulb, MdLightbulbOutline, MdKeyboardArrowRight } from 'react-icons/md'
import mqttClient from '../services/mqttConnection'



interface CardProps {
    _id: number;
    estado: boolean;
    color: string;
    nombre: string;
    brillo: number;
}


export default function LuzComponent({ _id, _estado, _color, _nombre, _brillo }: CardProps) {
  const mqttConnection = useRef();
  const [estado, setEstado] = useState(_estado);
  const [color, setColor] = useState(_color);
  const [nombre, setNombre] = useState(_nombre);
  const [brillo, setBrillo] = useState(_brillo);

  useEffect(() => {
    mqttConnection.current = mqttClient();
  }, [])

  useEffect(()=> {
    if (mqttConnection.current) {
        mqttConnection.current.on("message", (topicOfMessage, message) => {
          if (topicOfMessage === `/domotica/luces/${nombre.replace(/\s/g, '')}`) {
            const data = JSON.parse(message.toString());
            setEstado(data.estado);
            setColor(data.color);
            setNombre(data.nombre);
            setBrillo(data.brillo);
          }
        });
      }
  })

return(
    <div key={_id} className="lucesBlock">
              <div className={estado ? 'lucesBotonOn' : 'lucesBotonOff'}>
                {estado
                  ? (
                  <MdLightbulb size={45} style={{ color: color }} />
                    )
                  : (
                  <MdLightbulbOutline size={45} style={{ color: 'black' }} />
                    )}
                <span className="btitle">{nombre}</span>
              </div>
              <NavLink activeClassName="active" to={`/luces/edit/${_id}`} className="lucesAjustes">
                <span className="bsubtitle">{brillo}%</span>
                <MdKeyboardArrowRight size={30} style={{ color: '#2141df' }} />
              </NavLink>
            </div>
)
}
