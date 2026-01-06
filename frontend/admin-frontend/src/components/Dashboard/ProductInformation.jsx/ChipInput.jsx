import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';


const ChipInput = ({ name, label, register, errors, setValue }) => {
    const [tags, setTags] = useState([]);
    const {editProduct, product} = useSelector((state) => state.product);

    useEffect(() => {
        register(name, {
            required: true
        });
        if(editProduct){
            try{
                const parsedTags = Aray.isArray(product?.tag) ? product.tag : JSON.parse(product?.tag || '[]');
                settags
            }
        }
    })
}