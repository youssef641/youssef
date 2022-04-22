import React, { useState, useEffect } from 'react'
import { Grid, } from '@material-ui/core';
import Controls from "../../components/controls/Controls";
import { useForm, Form } from '../../components/controls/useForm';

import { useUserDispatch, signUp } from "../../context/UserContext";
import {Typography} from "@material-ui/core";
import jwt_decode from "jwt-decode";
import useStyles from "../notifications/styles";
const initialFValues = {
    
    nom: '',
    email: '',
    cin: '',
    matemp: '',
    prenom: '',
    password: '',
    
    departement: '',
    startDate: new Date(),
   
}

export default function EmployeeForm() {
 
    const token = localStorage.getItem('token');
    var user = jwt_decode(token)
    const dispatch = useUserDispatch();
    var classes = useStyles();
    var [errorToastId, setErrorToastId] = useState(null);
    const validate = (fieldValues = values) => {
        let temp = { ...errors }
        if ('fullName' in fieldValues)
            temp.fullName = fieldValues.fullName ? "" : "This field is required."
        if ('email' in fieldValues)
            temp.email = (/$^|.+@.+..+/).test(fieldValues.email) ? "" : "Email is not valid."
        if ('cin' in fieldValues)
            temp.cin = fieldValues.cin.length >= 8 ? "" : "Minimum 8 numbers required."
        if ('departement' in fieldValues)
            temp.departement = fieldValues.departement.length != 0 ? "" : "This field is required."
        setErrors({
            ...temp
        })

        if (fieldValues == values)
            return Object.values(temp).every(x => x == "")
    }
    var [error, setError] = useState("");
    const {
        values,
        setValues,
        errors,
        setErrors,
        handleInputChange,
        resetForm
    } = useForm(initialFValues, true, validate);
    values.sass=user.sass;
    
    const handleSubmit = e => {
        e.preventDefault()
        if (validate()){
          
           signUp(values,setError);
            
            
            console.log(error);
        }
    }
    
    
  
     
    

    return (
        <Form onSubmit={handleSubmit}>
            <Grid container>
                <Grid item xs={6}>
                    <Controls.Input
                        name="nom"
                        label="Nom"
                        value={values.nom}
                        onChange={handleInputChange}
                        error={errors.nom}
                    />
                     <Controls.Input
                        name="prenom"
                        label="Prenom"
                        value={values.prenom}
                        onChange={handleInputChange}
                        error={errors.prenom}
                    />
                    <Controls.Input
                        label="Email"
                        name="email"
                        value={values.email}
                        onChange={handleInputChange}
                        error={errors.email}
                    />
                    <Controls.Input
                        label="Cin"
                        name="cin"
                        value={values.cin}
                        onChange={handleInputChange}
                        error={errors.cin}
                    />
                    <Controls.Input
                        label="Matricule employee"
                        name="matemp"
                        value={values.matemp}
                        onChange={handleInputChange}
                    />
                    <Controls.Input
                        label="Mot de passe"
                        name="password"
                        type="Password"
                        value={values.password}
                        onChange={handleInputChange}
                    />

                </Grid>
                <Grid item xs={6}>
                  
                    <Controls.Select
                        name="departement"
                        label="Departement"
                        value={values.departement}
                        onChange={handleInputChange}
                        
                        error={errors.departement}
                    />
                    <Controls.DatePicker
                        name="startDate"
                        label="Date de debut "
                        value={values.startDate}
                        onChange={handleInputChange}
                    />
                 

                    <div>
                        <Controls.Button
                            type="submit"
                            text="Submit" />
                        <Controls.Button
                            text="Reset"
                            color="default"
                            onClick={resetForm} />
                           <Typography color="secondary" className={classes.errorMessage}>
                {error}
                </Typography>
                    </div>
                </Grid>
            </Grid>
        </Form>
    )
}