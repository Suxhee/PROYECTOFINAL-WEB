export function roles(... allowedRoles){
    return (req, res, next) => {
        if(!re.user) {
            return res.status(401).json({ 
                error: "Auth Required" 
            });
        }
        
        if(!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
            error: "Forbidden user role" ,  });
        }
        
        next();
    
    
    }
}